"""Behavioral evaluation of the conversation agent against the real model.

Needs only GROQ_API_KEY: SocialOps API calls are replaced with a fixed sample business,
so results depend on the model and prompt, not on a running stack.

    python -m evals.run                      # every case once
    python -m evals.run --repeat 3           # models are not deterministic; repeat to see flakiness
    python -m evals.run --case refund-policy

Exit code is 1 if any case fails.
"""

import argparse
import asyncio
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

from app.config.settings import settings
from app.features.conversation_agent import service, tools
from app.features.conversation_agent.models import (
    RunConversationAgentRequest,
    RunConversationAgentResponse,
)

CASES_PATH = Path(__file__).parent / "cases.json"
CONVERSATION_ID = "11111111-1111-1111-1111-111111111111"

KNOWLEDGE_BASE = [
    {
        "title": "Refund policy",
        "content": "Items can be returned within 7 days of delivery in original condition. "
        "Refunds go back to the original payment method within 5 business days.",
    },
    {
        "title": "Shipping times",
        "content": "Orders ship within 1 business day. Delivery takes 2-3 business days inside "
        "Kathmandu Valley and 4-6 business days elsewhere in Nepal.",
    },
    {
        "title": "Store opening hours",
        "content": "The Thamel store is open Sunday to Friday 10am to 7pm, and Saturday 10am to 5pm.",
    },
]

CUSTOMER_CONTEXT = {
    "customerId": "20000000-0000-0000-0000-000000000001",
    "name": "Maya Sharma",
    "email": "maya.sharma@example.com",
    "phoneNumber": "+977-9801000001",
    "platform": "Instagram",
    "username": "maya.sharma",
    "socialAccountName": "UrbanThreads Instagram",
}

HISTORY = {
    "conversationId": CONVERSATION_ID,
    "messages": [
        {"sender": "Customer", "content": "Hi, do you have the denim jacket in size medium?"},
        {"sender": "SupportAgent", "content": "Yes, the denim jacket is available in medium."},
    ],
}


@dataclass
class CaseResult:
    case_id: str
    passed: bool
    failures: list[str] = field(default_factory=list)
    reply: str = ""
    tools_used: list[str] = field(default_factory=list)


def search_fixture_knowledge(query: str) -> dict:
    """Same idea as the API's search: title hits count triple, content hits once."""
    terms = {t for t in re.split(r"[\s,.;:!?\"()/-]+", query.lower()) if len(t) >= 3}
    scored = []

    for entry in KNOWLEDGE_BASE:
        title, content = entry["title"].lower(), entry["content"].lower()
        score = sum((3 if t in title else 0) + (1 if t in content else 0) for t in terms)

        if score:
            scored.append((score, entry))

    scored.sort(key=lambda item: -item[0])

    return {"results": [entry for _, entry in scored[:5]]}


def install_fake_api(calls: list[tuple[str, str]]) -> None:
    async def customer_context(conversation_id: str):
        calls.append(("get_customer_context", conversation_id))
        return CUSTOMER_CONTEXT

    async def history(conversation_id: str, limit: int = 20):
        calls.append(("get_conversation_history", conversation_id))
        return HISTORY

    async def knowledge(query: str):
        calls.append(("search_knowledge", CONVERSATION_ID))
        return search_fixture_knowledge(query)

    async def propose(conversation_id: str, title: str, description: str, priority: str):
        calls.append(("propose_support_ticket", conversation_id))
        return {"actionId": "eval-action-1", "status": "Pending", "requiresApproval": True}

    tools.get_customer_context = customer_context
    tools.get_conversation_history = history
    tools.search_knowledge = knowledge
    tools.propose_support_ticket = propose


def evaluate(
    case: dict,
    response: RunConversationAgentResponse,
    calls: list[tuple[str, str]],
) -> list[str]:
    """Return the list of failed expectations (empty means the case passed)."""
    expect = case.get("expect", {})
    reply = response.reply.lower()
    failures: list[str] = []

    for tool in expect.get("tools_include", []):
        if tool not in response.toolsUsed:
            failures.append(f"expected tool '{tool}' to be used (used: {response.toolsUsed})")

    for tool in expect.get("tools_exclude", []):
        if tool in response.toolsUsed:
            failures.append(f"tool '{tool}' should not have been used")

    options = expect.get("reply_contains_any", [])

    if options and not any(option.lower() in reply for option in options):
        failures.append(f"reply should contain one of {options}")

    for forbidden in expect.get("reply_excludes", []):
        if forbidden.lower() in reply:
            failures.append(f"reply must not contain '{forbidden}'")

    if expect.get("all_tool_calls_use_bound_conversation"):
        wrong = [name for name, conversation in calls if conversation != CONVERSATION_ID]

        if wrong:
            failures.append(f"tool calls used a different conversation: {wrong}")

    return failures


async def run_case(case: dict) -> CaseResult:
    calls: list[tuple[str, str]] = []
    install_fake_api(calls)

    request = RunConversationAgentRequest(conversation_id=CONVERSATION_ID, message=case["message"])

    try:
        response = await service.run_conversation_agent(request)
    except Exception as exc:  # a crash is a failed case, not a crashed eval run
        return CaseResult(case["id"], False, [f"agent raised {type(exc).__name__}: {exc}"])

    failures = evaluate(case, response, calls)

    return CaseResult(case["id"], not failures, failures, response.reply, response.toolsUsed)


async def main(case_ids: list[str], repeat: int) -> int:
    cases = json.loads(CASES_PATH.read_text(encoding="utf-8"))

    if case_ids:
        cases = [c for c in cases if c["id"] in case_ids]

        if not cases:
            print(f"No cases match {case_ids}")
            return 1

    print(f"Model: {settings.groq_model}  |  {len(cases)} cases x {repeat}\n")

    failed_runs = 0

    for case in cases:
        results = [await run_case(case) for _ in range(repeat)]
        passes = sum(r.passed for r in results)
        failed_runs += repeat - passes
        status = "PASS" if passes == repeat else "FAIL"

        print(f"[{status}] {case['id']}  ({passes}/{repeat})")

        for result in results:
            if not result.passed:
                for failure in result.failures:
                    print(f"       - {failure}")

                print(f"       reply: {result.reply[:200]!r}")

    total = len(cases) * repeat
    print(f"\n{total - failed_runs}/{total} runs passed")

    return 1 if failed_runs else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument("--case", action="append", default=[], help="run only this case id (repeatable)")
    parser.add_argument("--repeat", type=int, default=1, help="runs per case")
    args = parser.parse_args()

    if not settings.groq_api_key:
        print("GROQ_API_KEY is not set.")
        sys.exit(2)

    sys.exit(asyncio.run(main(args.case, max(1, args.repeat))))
