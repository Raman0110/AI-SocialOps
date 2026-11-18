<#
.SYNOPSIS
  Restores the local UrbanThreads development dataset to its original seeded state.

.DESCRIPTION
  Calls a Development-only, TenantAdmin-protected API endpoint. The reset endpoint is disabled
  outside the Development environment and only accepts the seeded development organization.
#>
param(
    [string]$ApiUrl = "http://localhost:8080",
    [string]$Email = "owner@urbanthreads.local",
    [string]$Password = "ChangeMe123!"
)

$ErrorActionPreference = "Stop"

try {
    $session = Invoke-RestMethod `
        -Method POST `
        -Uri "$ApiUrl/api/auth/login" `
        -ContentType "application/json" `
        -Body (@{ email = $Email; password = $Password } | ConvertTo-Json)

    $result = Invoke-RestMethod `
        -Method POST `
        -Uri "$ApiUrl/api/development-data/reset" `
        -Headers @{ "Authorization" = "Bearer $($session.accessToken)" }
}
catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "Development data reset failed with HTTP $status. Confirm the Development API is running." -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message
    throw
}

Write-Host "Development data restored successfully." -ForegroundColor Green
Write-Host "Organization : $($result.organizationName) ($($result.organizationId))"
Write-Host "Customers    : $($result.customers)"
Write-Host "Conversations: $($result.conversations)"
Write-Host "Knowledge    : $($result.knowledgeEntries)"
Write-Host "Reset at UTC : $($result.resetAtUtc)"
