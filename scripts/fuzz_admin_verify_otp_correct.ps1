$ErrorActionPreference = "Continue"

function Invoke-FuzzPost([string]$uri, [string]$body) {
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $status = ""
  $respBody = ""
  try {
    $r = Invoke-WebRequest -Method POST -Uri $uri -TimeoutSec 15 -UseBasicParsing `
      -ContentType "application/json" -Body $body -ErrorAction Stop
    $status = $r.StatusCode
    $respBody = $r.Content
  } catch {
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
  Write-Output ("==== POST " + $uri)
  Write-Output ("STATUS=" + $status)
  Write-Output ("ELAPSED_MS=" + $elapsed)
  Write-Output "BODY_SAMPLE_BEGIN"
  if ($respBody -eq $null) { $respBody = "" }
  $len = $respBody.Length
  Write-Output ("BODY_LEN=" + $len)
  $sampleLen = 400
  if ($len -lt $sampleLen) { $sampleLen = $len }
  if ($sampleLen -gt 0) { Write-Output ($respBody.Substring(0, $sampleLen)) }
  Write-Output "BODY_SAMPLE_END"
}

$otpUri = "http://localhost:3000/api/admin/auth/verify-otp"

Invoke-FuzzPost -uri $otpUri -body "{"
Invoke-FuzzPost -uri $otpUri -body "{}"
Invoke-FuzzPost -uri $otpUri -body "{""email"":""test@example.com"",""otp"":""""}"
Invoke-FuzzPost -uri $otpUri -body "{""email"":""bad-email"",""otp"":""123456""}"
Invoke-FuzzPost -uri $otpUri -body "{""email"":""test@example.com"",""otp"":""123456""}"
Invoke-FuzzPost -uri $otpUri -body "{""email"":""test@example.com"",""otp"":""000000""}"
