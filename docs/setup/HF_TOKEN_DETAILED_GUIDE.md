# Detailed Hugging Face Token Creation Guide

## Step 1: Access Your Hugging Face Account
1. Open your browser and go to: https://huggingface.co
2. Click "Sign In" in the top right corner
3. Enter your credentials and log in

## Step 2: Navigate to Token Settings
1. Click on your profile picture/avatar in the top right corner
2. From the dropdown menu, select "Settings"
3. In the left sidebar, click on "Access Tokens"
   - Direct URL: https://huggingface.co/settings/tokens

## Step 3: Create New Token
1. You'll see your existing tokens listed (including your current `vidibemusai_website` token)
2. Click the blue "New token" button on the right side

## Step 4: Configure Token Settings (IMPORTANT)

### Token Name
- Enter: `vidibemus_ai_full_access` (or any descriptive name)

### Token Type Selection
**CRITICAL: Choose the correct type**

You'll see two options:
1. ❌ **Fine-grained** - DO NOT SELECT THIS
   - This is what you currently have and it's too restrictive
   
2. ✅ **Read** - SELECT THIS ONE
   - Click the "Read" radio button
   - Description says: "Read access to repos, models and datasets"
   - This is what you need for the inference API

### What "Read" Access Provides:
- ✅ Access to all public models
- ✅ Text generation (GPT-2, DialoGPT, etc.)
- ✅ Conversational AI
- ✅ Text classification
- ✅ Token classification
- ✅ Embeddings
- ✅ All inference API endpoints

## Step 5: Generate the Token
1. After selecting "Read", click the green "Generate a token" button
2. **IMMEDIATELY** copy the token that appears
   - It will look like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You'll see a "Copy" button next to it - click it

## Step 6: Save the Token
**IMPORTANT**: Save it immediately in a secure location because:
- You can NEVER see this token again after leaving this page
- If you lose it, you'll need to create a new one

Save it in:
1. A password manager
2. A secure notes app
3. Your `.env.local` file (see next step)

## Step 7: Update Your Project

1. Open your `.env.local` file at:
   ```
   C:\Users\victo\OneDrive\Documents\Data_Science_Projects\vidibemus_ai_website\.env.local
   ```

2. Find this line (around line 96):
   ```env
   HUGGINGFACE_API_KEY=hf_[YOUR_TOKEN_HERE]
   ```

3. Replace it with your new token:
   ```env
   HUGGINGFACE_API_KEY=hf_YOUR_NEW_TOKEN_HERE
   ```

## Step 8: Verify Token Creation
1. Go back to https://huggingface.co/settings/tokens
2. You should see both tokens listed:
   - `vidibemusai_website` (Fine-grained) - your old one
   - `vidibemus_ai_full_access` (Read) - your new one

## Step 9: Test the New Token

1. Save the `.env.local` file

2. Restart your development server:
   ```bash
   # First, stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

3. Test the token with our test script:
   ```bash
   node test-hf-finegrained.ts
   ```

   With the Read token, you should see:
   ```
   ✅ Text Generation - GPT2: SUCCESS
   ✅ Text Generation - DialoGPT: SUCCESS
   ✅ Conversational: SUCCESS
   ✅ Text Classification: SUCCESS
   ✅ Token Classification: SUCCESS
   ```

## Step 10: Clean Up (Optional)
Once you verify the new token works:
1. Go back to https://huggingface.co/settings/tokens
2. Find your old token `vidibemusai_website` (Fine-grained)
3. Click the three dots menu (...) next to it
4. Select "Revoke" to delete the old token

## Troubleshooting

### If you see "Invalid credentials" error:
- Double-check you copied the entire token (including the `hf_` prefix)
- Make sure there are no spaces before or after the token in `.env.local`
- Verify the token shows as "Read" type in your Hugging Face settings

### If models still fail:
- Some models may be private or require specific permissions
- The fallback system will handle these cases automatically
- Common working models: gpt2, microsoft/DialoGPT-small, distilbert models

## Why This Works

**Fine-grained tokens** (what you had):
- Limited to specific repos/models you explicitly grant access to
- Designed for production apps with minimal permissions
- Blocks most inference API calls

**Read tokens** (what you need):
- Access to all public models and datasets
- Full inference API capabilities
- Standard choice for development and AI applications

## Success Confirmation
Your Hugging Face integration is working when:
1. The test script shows all green checkmarks
2. Your website's AI chat can use Hugging Face models
3. No "Invalid credentials" errors in the console