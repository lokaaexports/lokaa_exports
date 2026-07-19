$ErrorActionPreference = "Continue"

function Invoke-FuzzPost([string]$uri, [string]$body) {
  $sw = [Diagnostics.Stopwatch]::StartNew()
  try {
    $r = Invoke-WebRequest -Method POST -Uri $uri -TimeoutSec 15 -UseBasicParsing `
      -ContentType "application/json" -Body $body -ErrorAction Stop
    $status = $r.StatusCode
    $respBody = $r.Content
    $headersEnum = $r.Headers.GetEnumerator()
  } catch {
    $status = ""
    $respBody = ""
    $headersEnum = @()
    try {
      $we = $_.Exception
      if ($we.Response -ne $null) {
        $status = $we.Response.StatusCode
        $respHeaders = $we.Response.Headers
        $headersEnum = $respHeaders.GetEnumerator() | ForEach-Object { $_ }
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
  Write-Output ("==== POST " + $uri)
  Write-Output ("STATUS=" + $status)
  Write-Output ("ELAPSED_MS=" + $elapsed)
  Write-Output ("BODY_SAMPLE_BEGIN")
  if ($respBody -eq $null) { $respBody = "" }
  $len = $respBody.Length
  Write-Output ("BODY_LEN=" + $len)
  $sampleLen = 400
  if ($len -lt $sampleLen) { $sampleLen = $len }
  if ($sampleLen -gt 0) {
    Write-Output ($respBody.Substring(0, $sampleLen))
  }
  Write-Output ("BODY_SAMPLE_END")
}

$loginUri = "http://localhost:3000/api/admin/auth/login"

Invoke-FuzzPost -uri $loginUri -body "{"
Invoke-FuzzPost -uri $loginUri -body "{}"
Invoke-FuzzPost -uri $loginUri -body "{""email"":""test@example.com"",""password"":""""}"
Invoke-FuzzPost -uri $loginUri -body "{""email"":""test@example.com"",""password"":""x"",""rememberMe"":true,""extra"":[$([char]0x00)] }"
Invoke-FuzzPost -uri $loginUri -body "{""email"":""<script>alert(1)</script>"",""password"":""password123!"",""rememberMe"":false}"
