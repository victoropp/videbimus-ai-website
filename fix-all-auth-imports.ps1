# PowerShell script to fix all getServerSession imports
$files = @(
    "src/app/api/analytics/route.ts",
    "src/app/api/blog/categories/route.ts",
    "src/app/api/blog/images/route.ts",
    "src/app/api/blog/posts/route.ts",
    "src/app/api/blog/posts/[id]/route.ts",
    "src/app/api/blog/search/route.ts",
    "src/app/api/blog/tags/route.ts"
)

foreach ($file in $files) {
    Write-Host "Fixing $file"
    
    # Read the file
    $content = Get-Content $file -Raw
    
    # Replace the import statements - handle various formats
    $content = $content -replace "import \{ getServerSession \} from 'next-auth'`r?`nimport \{ authConfig \} from '@/auth'", "import { getServerSession } from '@/auth'`nimport { authConfig } from '@/auth'"
    $content = $content -replace "import \{ getServerSession \} from 'next-auth'", "import { getServerSession } from '@/auth'"
    
    # Also check if authOptions is used instead of authConfig and fix it
    $content = $content -replace "import \{ authOptions \} from '@/auth'", "import { authOptions } from '@/auth'"
    
    # If getServerSession is called with authOptions or authConfig, we might need to adjust
    # But first just fix the imports
    
    # Write back to file
    Set-Content -Path $file -Value $content -NoNewline
    
    Write-Host "Fixed $file"
}

Write-Host "All files have been fixed"