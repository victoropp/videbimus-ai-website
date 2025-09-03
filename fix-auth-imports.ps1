# PowerShell script to fix getServerSession imports
$files = @(
    "src/app/api/ai/models/route.ts",
    "src/app/api/ai/recommendations/route.ts", 
    "src/app/api/ai/transcription/route.ts",
    "src/app/api/payments/customers/route.ts",
    "src/app/api/payments/payment-intents/route.ts",
    "src/app/api/payments/payment-methods/route.ts",
    "src/app/api/payments/payment-methods/setup-intent/route.ts",
    "src/app/api/payments/subscriptions/route.ts"
)

foreach ($file in $files) {
    Write-Host "Fixing $file"
    
    # Read the file
    $content = Get-Content $file -Raw
    
    # Replace the import statements
    $content = $content -replace "import \{ getServerSession \} from 'next-auth/next';`r?`nimport \{ authOptions \} from '@/auth';", "import { getServerSession, authOptions } from '@/auth';"
    $content = $content -replace "import \{ getServerSession \} from 'next-auth/next'`r?`nimport \{ authOptions \} from '@/auth'", "import { getServerSession, authOptions } from '@/auth'"
    
    # Write back to file
    Set-Content -Path $file -Value $content -NoNewline
    
    Write-Host "Fixed $file"
}

Write-Host "All files have been fixed"