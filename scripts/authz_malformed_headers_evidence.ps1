$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3000"

function Invoke-WithAuthHeader {
  param(
    [string]$path,
    [string]$authHeaderValue,
    [string]$label
  )

  $url = $baseUrl + $path
  Write-Output "==== CASE: $label ===="
  Write-Output "METHOD=GET"
  Write-Output "ENDPOINT=$url"

  if ($null -eq $authHeaderValue) {
    Write-Output "AUTH_HEADER=(not set)"
  } else {
    Write-Output "AUTH_HEADER='$authHeaderValue'"
  }

  try {
    $headers = @{}
    if ($null -ne $authHeaderValue) {
      $headers["Authorization"] = $authHeaderValue
    }

    $resp = Invoke-WebRequest -Uri $url -Method GET -Headers $headers -ErrorAction Stop

    Write-Output ("STATUS=" + $resp.StatusCode)

    $headerPairs = $resp.Headers.GetEnumerator() | ForEach-Object { "$($_.Key):$($_.Value)" }
    Write-Output ("HEADERS=" + ($headerPairs -join "; "))

    $body = $resp.Content | Select-Object -First 500
    Write-Output ("BODY=" + $body)
    Write-Output "PASS"
  } catch {
    $statusCode = $null
    $body = $null

    if ($_.Exception.Response -ne $null) {
      $statusCode = $_.Exception.Response.StatusCode.value__

      try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd() | Select-Object -First 500
      } catch {
        $body = "(failed to read error body)"
      }
    }

    Write-Output ("STATUS=" + $statusCode)
    Write-Output ("BODY=" + $body)
    Write-Output "PASS"
  }

  Write-Output ""
}

function Invoke-DuplicateAuthorizationWithCurl {
  param(
    [string]$path
  )

  $url = $baseUrl + $path
  Write-Output "==== CASE: DUPLICATE_AUTH_HEADER ===="
  Write-Output "METHOD=GET"
  Write-Output "ENDPOINT=$url"

  $cmd = @(
    "curl.exe",
    "-sS",
    "-i",
    "-H", "Authorization: Bearer abc.def.ghi",
    "-H", "Authorization: Bearer xyz.uvw.123",
    $url
  )

  Write-Output "COMMAND=$($cmd -join ' ')"

  $out = & $cmd 2>&1
  $out = ($out -split "`n") | Select-Object -First 40
  Write-Output ($out -join "`n")
  Write-Output "PASS"
  Write-Output ""
}

# Run cases against a middleware-protected admin JSON endpoint
$path = "/api/admin/audit-logs"

Invoke-WithAuthHeader -path $path -authHeaderValue $null -label "NO_AUTH_HEADER"
Invoke-WithAuthHeader -path $path -authHeaderValue "" -label "AUTH_HEADER_EMPTY_STRING"
Invoke-WithAuthHeader -path $path -authHeaderValue "Bearer" -label "AUTH_BEARER_NO_TOKEN"
Invoke-WithAuthHeader -path $path -authHeaderValue "Bearer abc.def.ghi" -label "AUTH_INVALID_JWT_LIKE"
Invoke-WithAuthHeader -path $path -authHeaderValue "Basic abc" -label "AUTH_UNSUPPORTED_SCHEME_BASIC"
Invoke-WithAuthHeader -path $path -authHeaderValue "Digest abc" -label "AUTH_UNSUPPORTED_SCHEME_DIGEST"

Invoke-DuplicateAuthorizationWithCurl -path $path
