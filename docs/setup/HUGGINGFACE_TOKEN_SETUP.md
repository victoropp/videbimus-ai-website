# Hugging Face Token Setup Guide

## Current Issue
Your current token (`hf_[YOUR_TOKEN_HERE]`) has **FINEGRAINED** permissions which limits it to specific operations. The test results show:
- ❌ Text Generation - FAILED
- ❌ Conversational AI - FAILED  
- ❌ Text Classification - FAILED
- ✅ Token Classification - WORKS

## Solution: Create a New Token with Proper Permissions

### Step 1: Go to Hugging Face Settings
1. Visit https://huggingface.co/settings/tokens
2. Click "New token"

### Step 2: Configure Token Settings
1. **Token name**: `vidibemus_ai_inference` (or any name you prefer)
2. **Token type**: Choose **"Read"** (NOT Fine-grained)
   - Read access is sufficient for inference API
   - Allows access to all public models
   - Enables text generation, conversational AI, and other inference endpoints

### Step 3: Create and Copy Token
1. Click "Generate token"
2. Copy the new token immediately (starts with `hf_`)
3. Save it securely - you won't be able to see it again

### Step 4: Update Your Environment
Replace the token in `.env.local`:
```env
HUGGINGFACE_API_KEY=hf_YOUR_NEW_TOKEN_HERE
```

### Step 5: Restart Your Application
```bash
# Kill any running servers
# Then restart
npm run dev
```

## Why Fine-grained Tokens Don't Work

Fine-grained tokens are designed for:
- Accessing specific private repositories
- Limited operations on specific models
- Enhanced security for production deployments

For general inference API usage (text generation, chat), you need:
- **Read** or **Write** token type
- These provide broader access to Hugging Face's inference endpoints

## Testing Your New Token

After updating, you can test with:
```bash
node test-hf-finegrained.ts
```

All tests should pass with a Read token.

## Note on Current Functionality
Your website's AI chat is currently working through the enhanced fallback system, providing intelligent responses even without Hugging Face. Once you update the token, you'll have access to additional AI models through Hugging Face's inference API.