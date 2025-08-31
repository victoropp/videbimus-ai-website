@echo off
echo === Hugging Face Token Setup ===
echo.
echo Please enter your Hugging Face token (starts with hf_):
set /p TOKEN=

echo.
echo Adding token to .env.local...

:: Remove existing token if present
powershell -Command "(Get-Content .env.local) | Where-Object {$_ -notmatch 'NEXT_PUBLIC_HUGGINGFACE_API_KEY'} | Set-Content .env.local" 2>nul

:: Add the new token
echo NEXT_PUBLIC_HUGGINGFACE_API_KEY=%TOKEN%>> .env.local

echo.
echo Token added successfully!
echo.
echo You can now use Qwen 2.5 32B in your AI Playground.
echo.
echo Please restart your dev server for changes to take effect:
echo   1. Press Ctrl+C to stop the current server
echo   2. Run: npm run dev
echo.
pause