$p = Get-Location
$found = $false

while ($p -and -not $found) {
  $gitPath = Join-Path $p.Path '.git'
  if (Test-Path $gitPath) {
    Write-Output ('FOUND_GIT_ROOT=' + $p.Path)
    $found = $true
    break
  }

  $parent = Split-Path $p.Path -Parent
  if (-not $parent -or $parent -eq $p.Path) {
    break
  }
  $p = Get-Item $parent
}

if (-not $found) {
  Write-Output 'NO_GIT_ROOT_FOUND_UPWARD'
}
