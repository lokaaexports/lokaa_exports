$ErrorActionPreference = "Continue"

param(
  [string]$CookieHeader = "",
  [string]$Method = "GET",
  [string]$Uri = "http://localhost:3000/api/admin/audit-logs",
  [string]$Body = ""
)

$sw = [Diagnostics.Stopwatch]::StartNew()

$status = ""
$bodyText = ""
$headersEnum = @()

try {
  $headers = @{}
  if ($CookieHeader -ne "") {
    $headers["Cookie"] = $CookieHeader
  }

  if ($Method -ieq "GET") {
    $r = Invoke-WebRequest -Method GET -Uri $Uri -TimeoutSec 15 -UseBasicParsing -Headers $headers -ErrorAction Stop
  } else {
    $contentType = "application/json"
    if ($Body -eq "") {
      $r = Invoke-WebRequest -Method $Method -Uri $Uri -TimeoutSec 15 -UseBasicParsing -Headers $headers -ContentType $contentType -ErrorAction Stop
    } else {
      $r = Invoke-WebRequest -Method $Method -Uri $Uri -TimeoutSec 15 -UseBasicParsing -Headers $headers -Body $Body -ContentType $contentType -ErrorAction Stop
    }
  }

  $status = $r.StatusCode
  $bodyText = $r.Content
  $headersEnum = $r.Headers.GetEnumerator()
} catch {
  try {
    $we = $_.Exception
    if ($we.Response -ne $null) {
      $resp = $we.Response
      $status = $resp.StatusCode
      $respHeaders = $resp.Headers
      $headersEnum = $respHeaders.GetEnumerator() | ForEach-Object { $_ }

      $stream = $resp.GetResponseStream()
      if ($stream -ne $null) {
        $sr = New-Object System.IO.StreamReader($stream)
        $bodyText = $sr.ReadToEnd()
      }
    }
  } catch {
    # leave empty
  }
} finally {
  $sw.Stop()
}

$elapsed = $sw.ElapsedMilliseconds
Write-Output ("STATUS=" + $status)
Write-Output ("ELAPSED_MS=" + $elapsed)

Write-Output "HEADERS_BEGIN"
foreach ($h in $headersEnum) {
  try {
    Write-Output ($h.Key + ":" + $h.Value)
  } catch {
    Write-Output ($h.ToString())
  }
}
Write-Output "HEADERS_END"

$len = 0
try { $len = $bodyText.Length } catch { $len = 0 }
Write-Output ("BODY_LEN=" + $len)

$sampleLen = 400
if ($len -lt $sampleLen) { $sampleLen = $len }

$sample = ""
if ($sampleLen -gt 0) {
  $sample = $bodyText.Substring(0, $sampleLen)
}
Write-Output "BODY_SAMPLE_BEGIN"
Write-Output $sample
Write-Output "BODY_SAMPLE_END"
