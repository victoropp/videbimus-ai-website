# Final Verification Script
Write-Output "=== FINAL VERIFICATION ==="
Write-Output ""

$backupDir = ".\public\images-backup"
$imagesDir = ".\public\images"

Write-Output "Original Images (backed up):"
$backup = Get-ChildItem $backupDir -Recurse -Include *.jpg,*.jpeg,*.png | Measure-Object -Property Length -Sum
Write-Output "Count: $($backup.Count), Size: $([math]::Round($backup.Sum/1MB, 2)) MB"

Write-Output ""
Write-Output "Optimized JPEG/PNG:"
$optimized = Get-ChildItem $imagesDir -Recurse -Include *.jpg,*.jpeg,*.png | Measure-Object -Property Length -Sum
Write-Output "Count: $($optimized.Count), Size: $([math]::Round($optimized.Sum/1MB, 2)) MB"
Write-Output "Savings: $([math]::Round(($backup.Sum - $optimized.Sum)/1MB, 2)) MB ($([math]::Round(($backup.Sum - $optimized.Sum)/$backup.Sum * 100, 1))%)"

Write-Output ""
Write-Output "WebP Versions:"
$webp = Get-ChildItem $imagesDir -Recurse -Include *.webp | Measure-Object -Property Length -Sum
Write-Output "Count: $($webp.Count), Size: $([math]::Round($webp.Sum/1MB, 2)) MB"
Write-Output "Savings: $([math]::Round(($backup.Sum - $webp.Sum)/1MB, 2)) MB ($([math]::Round(($backup.Sum - $webp.Sum)/$backup.Sum * 100, 1))%)"

Write-Output ""
Write-Output "=== VERIFICATION COMPLETE ==="
