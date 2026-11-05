import json
from types import SimpleNamespace

import pytest

from app.features.conversation_agent import service, tools
from app.features.conversation_agent.models import RunConversationAgentResponse
from evals import run as evals

CASES = json.loads(evals.CASES_PATH.read_text(encoding="utf-8"))
KNOWN_TOOLS = {"search_knowledge", "get_customer_context", "get_conversation_history", "propose_support_ticket"}


def response(reply: str, tools_used: list[str] | None = None) -> RunConversationAgentResponse:
    return RunConversationAgentResponse(reply=reply, toolsUsed=tools_used or [], model="test")


def case(**expect) -> dict:
    return {"id": "x", "message": "m", "expect": expect}


def test_case_file_is_well_formed():
    ids = [c["id"] for c in CASES]

    assert len(ids) == len(set(ids))

    for c in CASES:
        assert c["message"].strip()

        for key in ("tools_include", "tools_exclude"):
            assert set(c["expect"].get(key, [])) <= KNOWN_TOOLS, c["id"]


def test_knowledge_cases_are_answerable_from_the_sample_knowledge_base():
    for c in CASES:
        if "search_knowledge" not in c["expect"].get("tools_include", []):
            continue

        needles = c["expect"].get("reply_contains_any", [])
        hits = evals.search_fixture_knowledge(c["message"])["results"]
        text = " ".join(h["content"] for h in hits).lower()

        # Cases that expect a fact must be able to find it; "not in knowledge base" cases must not.
        if c["id"] == "not-in-knowledge-base":
            assert hits == []
        else:
            assert any(n.lower() in text for n in needles), c["id"]


def test_evaluate_passes_a_matching_response():
    failures = evals.evaluate(
        case(tools_include=["search_knowledge"], reply_contains_any=["7 days"]),
        response("You can return items within 7 days.", ["search_knowledge"]),
        [],
    )

    assert failures == []


@pytest.mark.parametrize(
    ("expect", "reply", "tools_used", "fragment"),
    [
        ({"tools_include": ["search_knowledge"]}, "ok", [], "expected tool"),
        ({"tools_exclude": ["propose_support_ticket"]}, "ok", ["propose_support_ticket"], "should not have been used"),
        ({"reply_contains_any": ["7 days"]}, "Within a week.", [], "should contain one of"),
        ({"reply_excludes": ["has been cancelled"]}, "Your order HAS BEEN CANCELLED.", [], "must not contain"),
    ],
)
def test_evaluate_reports_each_kind_of_failure(expect, reply, tools_used, fragment):
    failures = evals.evaluate(case(**expect), response(reply, tools_used), [])

    assert len(failures) == 1
    assert fragment in failures[0]


def test_evaluate_flags_tool_calls_on_another_conversation():
    calls = [("get_conversation_history", "99999999-9999-9999-9999-999999999999")]

    failures = evals.evaluate(case(all_tool_calls_use_bound_conversation=True), response("ok"), calls)

    assert "different conversation" in failures[0]


async def test_run_case_scores_a_scripted_model_run(monkeypatch):
    # Restore the module-level tool functions that run_case overwrites.
    for name in ("get_customer_context", "get_conversation_history", "search_knowledge", "propose_support_ticket"):
        monkeypatch.setattr(tools, name, getattr(tools, name))

    call = SimpleNamespace(
        id="c1",
        function=SimpleNamespace(name="search_knowledge", arguments=json.dumps({"query": "refund policy"})),
    )
    script = [
        SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=None, tool_calls=[call]))]),
        SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content="Returns within 7 days.", tool_calls=None))]),
    ]

    async def create(**_):
        return script.pop(0)

    monkeypatch.setattr(service, "client", SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create))))

    result = await evals.run_case(next(c for c in CASES if c["id"] == "refund-policy"))

    assert result.passed, result.failures
    assert result.tools_used == ["search_knowledge"]


async def test_run_case_counts_an_agent_crash_as_a_failed_case(monkeypatch):
    for name in ("get_customer_context", "get_conversation_history", "search_knowledge", "propose_support_ticket"):
        monkeypatch.setattr(tools, name, getattr(tools, name))

    async def create(**_):
        raise service.AgentRunError("boom")

    monkeypatch.setattr(service, "client", SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create))))

    result = await evals.run_case(CASES[0])

    assert not result.passed
    assert "AgentRunError" in result.failures[0]
