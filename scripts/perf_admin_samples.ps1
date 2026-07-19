$ErrorActionPreference = "Continue"

function Time-Request([string]$uri, [string]$method, [hashtable]$headers, [string]$body) {
  $sw = [Diagnostics.Stopwatch]::StartNew()
  try {
    if ($method -ieq "GET") {
      $r = Invoke-WebRequest -Method GET -Uri $uri -TimeoutSec 15 -UseBasicParsing -Headers $headers -ErrorAction Stop
    } else {
      $r = Invoke-WebRequest -Method $method -Uri $uri -TimeoutSec 15 -UseBasicParsing -Headers $headers -ContentType "application/json" -Body $body -ErrorAction Stop
    }
    $status = $r.StatusCode
    $respBody = $r.Content
  } catch {
    $status = ""
    $respBody = ""
    try {
      $we = $_.Exception
      if ($we.Response -ne $null) {
        $status = $we.Response.StatusCode
        $stream = $we.Response.GetResponseStream()
        if ($stream -ne $null) {
          $sr = New-Object System.IO.StreamReader($stream)
          $respBody = $sr.ReadToEnd()
        }
      }
    } catch {}
  } finally {
    $sw.Stop()
  }

  $elapsed = $sw.ElapsedMilliseconds
  Write-Output ("==== " + $method + " " + $uri)
  Write-Output ("STATUS=" + $status)
  Write-Output ("ELAPSED_MS=" + $elapsed)
  Write-Output "BODY_SAMPLE_BEGIN"
  if ($respBody -eq $null) { $respBody = "" }
  $sampleLen = 250
  if ($respBody.Length -lt $sampleLen) { $sampleLen = $respBody.Length }
  if ($sampleLen -gt 0) { Write-Output ($respBody.Substring(0,$sampleLen)) }
  Write-Output "BODY_SAMPLE_END"
}

$headersNoAuth = @{}
Time-Request -uri "http://localhost:3000/api/admin/audit-logs" -method "GET" -headers $headersNoAuth -body ""

$headersJson = @{}
Time-Request -uri "http://localhost:3000/api/admin/auth/login" -method "POST" -headers $headersJson -body "{"

$headersJson2 = @{}
Time-Request -uri "http://localhost:3000/api/admin/auth/login" -method "POST" -headers $headersJson2 -body "{""email"":""test@example.com"",""password"":""x""}"
