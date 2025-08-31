# Working Hugging Face Models for Vidibemus AI

## Token Information
- **Token Name:** vidibemusai_website_write
- **Token Type:** WRITE (Full permissions)
- **Success Rate:** 47.8% (11 out of 23 models working)

## ✅ WORKING MODELS

### 🎯 Text Classification (Sentiment Analysis)
1. **cardiffnlp/twitter-roberta-base-sentiment**
   - Twitter-trained sentiment analysis
   - Returns: LABEL_0 (negative), LABEL_1 (neutral), LABEL_2 (positive)
   - Great for social media sentiment

2. **nlptown/bert-base-multilingual-uncased-sentiment**
   - 5-star rating sentiment (1-5 stars)
   - Multilingual support
   - Perfect for product reviews

### 🏷️ Named Entity Recognition (NER)
1. **dbmdz/bert-large-cased-finetuned-conll03-english** ⭐ RECOMMENDED
   - Best performance for English NER
   - Identifies: Person, Organization, Location, Miscellaneous
   - High accuracy scores

2. **dslim/bert-base-NER**
   - Lighter weight alternative
   - Good for basic entity extraction
   - Faster processing

3. **Davlan/bert-base-multilingual-cased-ner-hrl**
   - Multilingual NER support
   - Works with 10+ languages
   - Good for international applications

### 📝 Text Summarization
1. **facebook/bart-large-cnn** ⭐ RECOMMENDED
   - State-of-the-art summarization
   - Trained on CNN/DailyMail dataset
   - Excellent for news and articles

2. **sshleifer/distilbart-cnn-12-6**
   - Faster, smaller version of BART
   - 2x faster inference
   - Good balance of speed and quality

### 🌍 Translation
1. **Helsinki-NLP/opus-mt-en-es**
   - English to Spanish translation
   - High quality translations
   
2. **Helsinki-NLP/opus-mt-en-fr**
   - English to French translation
   - Professional quality output

### ❓ Question Answering
1. **deepset/roberta-base-squad2**
   - Extracts answers from context
   - Trained on SQuAD 2.0
   - Handles unanswerable questions

### 🎯 Zero-Shot Classification
1. **facebook/bart-large-mnli**
   - Classify text without training
   - Dynamic label assignment
   - Extremely versatile

## ❌ MODELS WITH ISSUES

### Text Generation (All failing due to HF infrastructure)
- gpt2, gpt2-medium, distilgpt2
- EleutherAI/gpt-neo-125M
- microsoft/DialoGPT-small
- facebook/opt-125m

**Note:** These models return "blob fetching" errors - this is a Hugging Face server issue, not a token problem.

### Other Models with Issues
- distilbert-base-uncased-finetuned-sst-2-english
- google/pegasus-xsum (500 Internal Server Error)
- bert-base-uncased (Fill-mask)
- roberta-base (Fill-mask)
- sentence-transformers/all-MiniLM-L6-v2 (Embeddings)

## 🚀 Implementation Recommendations

### For Your AI Chat Feature
Use these working models in your `providers.ts`:

```typescript
// Sentiment Analysis
const sentiment = await hf.textClassification({
  model: 'nlptown/bert-base-multilingual-uncased-sentiment',
  inputs: userMessage
});

// Named Entity Recognition
const entities = await hf.tokenClassification({
  model: 'dbmdz/bert-large-cased-finetuned-conll03-english',
  inputs: userMessage
});

// Summarization
const summary = await hf.summarization({
  model: 'facebook/bart-large-cnn',
  inputs: longText,
  parameters: { max_length: 150 }
});

// Question Answering
const answer = await hf.questionAnswering({
  model: 'deepset/roberta-base-squad2',
  inputs: {
    question: userQuestion,
    context: documentContext
  }
});

// Zero-shot Classification
const classification = await hf.zeroShotClassification({
  model: 'facebook/bart-large-mnli',
  inputs: text,
  parameters: {
    candidate_labels: ['technical', 'business', 'support', 'general']
  }
});
```

## 📊 Summary

Your WRITE token provides access to:
- ✅ 2 Sentiment Analysis models
- ✅ 3 Named Entity Recognition models
- ✅ 2 Summarization models
- ✅ 2 Translation models
- ✅ 1 Question Answering model
- ✅ 1 Zero-shot Classification model

While text generation models are currently experiencing issues on Hugging Face's infrastructure, your website has a robust fallback system that ensures continuous AI chat functionality.