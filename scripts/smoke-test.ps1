<#
.SYNOPSIS
  End-to-end check of the receive -> draft -> send loop against a locally running stack.

.DESCRIPTION
  1. makes sure a knowledge entry exists (so the agent has something to answer from)
  2. posts a sandbox Instagram webhook message as a customer
  3. asks the agent to draft a reply
  4. sends the draft as a human reply and shows its delivery status

  Needs the API, the agent (with GROQ_API_KEY set) and Postgres running.
  See docs/LOCAL_RUN.md.
#>
param(
    [string]$ApiUrl = "http://localhost:8080",
    [string]$Email = "owner@urbanthreads.local",
    [string]$Password = "ChangeMe123!",
    [string]$OrganizationId = "00000000-0000-0000-0000-000000000001",
    [string]$BusinessAccountId = "ig_17841400000000991",
    [string]$Question = "Hi! What is your refund policy?"
)

$ErrorActionPreference = "Stop"
$headers = @{}

function Step($text) { Write-Host "`n== $text" -ForegroundColor Cyan }

function Invoke-Api($method, $path, $body) {
    $params = @{ Method = $method; Uri = "$ApiUrl$path"; Headers = $headers }

    if ($null -ne $body) {
        $params.ContentType = "application/json"
        $params.Body = ($body | ConvertTo-Json -Depth 5)
    }

    try {
        Invoke-RestMethod @params
    }
    catch {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "Request failed: $method $path -> HTTP $status" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message
        throw
    }
}

Step "Signing in and checking the API is reachable"
$session = Invoke-Api POST "/api/auth/login" @{
    email    = $Email
    password = $Password
}
$headers.Authorization = "Bearer $($session.accessToken)"
$null = Invoke-Api GET "/api/conversations?organizationId=$OrganizationId" $null
Write-Host "OK"

Step "Making sure the refund policy exists in the knowledge base"
$entries = @(Invoke-Api GET "/api/knowledge" $null)

if (-not ($entries | Where-Object { $_.title -eq "Refund policy" })) {
    $null = Invoke-Api POST "/api/knowledge" @{
        title   = "Refund policy"
        content = "Items can be returned within 7 days of delivery in original condition. Refunds go back to the original payment method within 5 business days after we receive the item."
    }
    Write-Host "Added 'Refund policy' (smoke-test sample text, edit or delete it later)"
}
else {
    Write-Host "Already there"
}

Step "Posting a customer message through the sandbox webhook"
$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$webhook = Invoke-Api POST "/api/webhooks/instagram/sandbox" @{
    businessAccountId = $BusinessAccountId
    senderId          = "smoke_customer"
    senderUsername    = "smoke.customer"
    conversationId    = "smoke_conv"
    messageId         = "smoke_msg_$suffix"
    text              = $Question
}
$conversationId = $webhook.conversationId
Write-Host "Conversation: $conversationId  (duplicate: $($webhook.duplicate))"

Step "Asking the agent for a draft reply (this calls Groq)"
$draft = Invoke-Api POST "/api/conversations/$conversationId/agent-reply" $null
Write-Host "Tools used : $($draft.toolsUsed -join ', ')"
Write-Host "Pending actions: $($draft.pendingActionIds.Count)"
Write-Host "Draft      : $($draft.reply)"

if ($draft.toolsUsed -notcontains "search_knowledge") {
    Write-Host "NOTE: the agent did not search the knowledge base for a policy question." -ForegroundColor Yellow
}

Step "Sending the draft as a human reply"
$sent = Invoke-Api POST "/api/conversations/$conversationId/messages" @{
    direction         = "Outbound"
    senderType        = "HumanAgent"
    content           = $draft.reply
    externalMessageId = $null
}
Write-Host "Delivery status: $($sent.deliveryStatus)"

if ($sent.deliveryError) { Write-Host "Delivery error : $($sent.deliveryError)" -ForegroundColor Yellow }

Step "Done"
Write-Host "Open the inbox in the web app and check the conversation with smoke.customer."
