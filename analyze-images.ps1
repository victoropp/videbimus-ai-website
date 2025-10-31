# Image Analysis Script
$baseDir = "C:\Users\victo\Documents\Data_Science_Projects\videbimus-ai-website\public\images"
Set-Location $baseDir

Write-Output "=== Image Directory Analysis ==="
Write-Output ""

$totalFiles = 0
$totalSize = 0

$dirs = Get-ChildItem -Directory | Sort-Object Name
foreach ($dir in $dirs) {
    $files = Get-ChildItem -Path $dir.FullName -Recurse -Include *.jpg,*.jpeg,*.png,*.webp
    if ($files.Count -gt 0) {
        $size = ($files | Measure-Object -Property Length -Sum).Sum
        $totalFiles += $files.Count
        $totalSize += $size
        $sizeKB = [math]::Round($size/1KB, 2)
        Write-Output ("$($dir.Name) | Files: $($files.Count) | Size: $sizeKB KB")
    }
}

Write-Output ""
Write-Output "=== Total Summary ==="
Write-Output "Total Files: $totalFiles"
Write-Output "Total Size: $([math]::Round($totalSize/1KB, 2)) KB ($([math]::Round($totalSize/1MB, 2)) MB)"

Write-Output ""
Write-Output "=== Largest Images (Top 20) ==="
$allImages = Get-ChildItem -Recurse -Include *.jpg,*.jpeg,*.png,*.webp | Sort-Object Length -Descending | Select-Object -First 20
foreach ($img in $allImages) {
    $relPath = $img.FullName.Replace($baseDir + "\", "")
    $sizeKB = [math]::Round($img.Length/1KB, 2)
    Write-Output ("$sizeKB KB | $relPath")
}
