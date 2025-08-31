# PowerShell script to set up Hugging Face token
# Run this script after copying your token from the .docx file

Write-Host "=== Hugging Face Token Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please paste your Hugging Face token (it should start with 'hf_'):" -ForegroundColor Yellow
$token = Read-Host

if ($token -match "^hf_[a-zA-Z0-9]+$") {
    # Check if .env.local exists
    $envFile = ".env.local"
    
    # Remove any existing HF token line
    if (Test-Path $envFile) {
        $content = Get-Content $envFile | Where-Object { $_ -notmatch "NEXT_PUBLIC_HUGGINGFACE_API_KEY" }
        $content | Set-Content $envFile
    }
    
    # Add the new token
    Add-Content -Path $envFile -Value "NEXT_PUBLIC_HUGGINGFACE_API_KEY=$token"
    
    Write-Host ""
    Write-Host "✅ Token added successfully to .env.local!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Testing connection to Qwen model..." -ForegroundColor Yellow
    
    # Test the API endpoint
    $testUrl = "http://localhost:3009/api/ai/chat/qwen"
    try {
        $response = Invoke-WebRequest -Uri $testUrl -Method GET -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        
        if ($result.status -eq "connected") {
            Write-Host "✅ Successfully connected to Qwen model!" -ForegroundColor Green
            Write-Host ""
            Write-Host "You can now use Qwen 2.5 32B in your AI Playground at:" -ForegroundColor Cyan
            Write-Host "http://localhost:3009/ai" -ForegroundColor White
        } else {
            Write-Host "⚠️ Connection test failed. Please check your token." -ForegroundColor Red
        }
    } catch {
        Write-Host "⚠️ Could not test connection. Make sure the dev server is running." -ForegroundColor Yellow
        Write-Host "Start it with: npm run dev" -ForegroundColor White
    }
} else {
    Write-Host "❌ Invalid token format. Token should start with 'hf_'" -ForegroundColor Red
    Write-Host "Please get your token from: https://huggingface.co/settings/tokens" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")