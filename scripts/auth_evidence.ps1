$ErrorActionPreference = "Stop"

$uri = "http://localhost:3000/api/admin/audit-logs"
$sw = [Diagnostics.Stopwatch]::StartNew()

try {
  $r = Invoke-WebRequest -Method GET -Uri $uri -TimeoutSec 15 -UseBasicParsing
} finally {
  $sw.Stop()
}

$status = $r.StatusCode
$elapsed = $sw.ElapsedMilliseconds

Write-Output ("STATUS=" + $status)
Write-Output ("ELAPSED_MS=" + $elapsed)

# Headers
Write-Output "HEADERS_BEGIN"
foreach ($e in $r.Headers.GetEnumerator()) {
  Write-Output ($e.Key + ":" + $e.Value)
}
Write-Output "HEADERS_END"

# Body (sample)
$body = $r.Content
$bodyLen = $body.Length
Write-Output ("BODY_LEN=" + $bodyLen)

$sampleLen = 400
if ($bodyLen -lt $sampleLen) { $sampleLen = $bodyLen }
$sample = ""
if ($sampleLen -gt 0) { $sample = $body.Substring(0, $sampleLen) }

Write-Output "BODY_SAMPLE_BEGIN"
Write-Output $sample
Write-Output "BODY_SAMPLE_END"
