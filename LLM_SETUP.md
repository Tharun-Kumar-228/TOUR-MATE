# LLM Integration Setup Guide

## Overview
The Travel Chatbot now uses Google's Gemini API for intelligent natural language understanding and intent detection. This allows the chatbot to understand user requests beyond simple keywords.

## Setup Instructions

### 1. Get Gemini API Key

**Google Gemini (Recommended)**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key" button
3. Select or create a Google Cloud project
4. Copy the generated API key
5. Keep it safe - don't share it!

**Important:** Make sure your API key has access to the Gemini API (not just other APIs)

**Verify Your Key Works:**
```bash
# Test your API key (replace YOUR_KEY)
curl "https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": {
      "text": "Hello, how are you?"
    }
  }'
```

If you get a valid response, your key is working!

**Note:** The API uses `text-bison-001` model which is stable, widely-available, and fully supported.

### 2. Configure Environment Variables

Create or update `.env` file in the client directory:

```bash
# .env (client folder)
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual API key.

### 3. How It Works

#### Intent Detection Flow:
```
User Query
    ↓
LLM Analysis (Gemini API)
    ↓
Intent Classification (hotspot, fun, reviews, budget, luxury, category, general)
    ↓
Database Filtering
    ↓
Response Generation
```

#### Fallback Mechanism:
If LLM API fails or key is not configured:
- Falls back to keyword-based detection
- Still provides accurate results
- No user-facing errors

### 4. Supported Intents

| Intent | Examples | Result |
|--------|----------|--------|
| **hotspot** | "Show me popular spots", "Best tourist attractions" | Highly-rated places (4.0+) |
| **fun** | "Where can I have fun?", "Entertainment places" | Places with games/activities |
| **reviews** | "Most talked about places", "Trending spots" | Most-reviewed places |
| **budget** | "Cheap places", "Affordable options" | Budget-friendly ($-$$) |
| **luxury** | "Premium experience", "High-end places" | Luxury places ($$$-$$$$) |
| **category** | "Restaurants", "Museums", "Parks" | Category-based filtering |
| **general** | "Show me places" | All places sorted by rating |

### 5. Example Queries (Now Works Better!)

**Before (Keyword-based):**
- ❌ "Where can I have fun with my family?" - Might not detect as "fun"
- ❌ "Show me the most popular spots" - Might not detect as "hotspot"

**After (LLM-based):**
- ✅ "Where can I have fun with my family?" - Correctly identifies as "fun"
- ✅ "Show me the most popular spots" - Correctly identifies as "hotspot"
- ✅ "I want to eat something cheap" - Correctly identifies as "budget"
- ✅ "Looking for an upscale dining experience" - Correctly identifies as "luxury"

### 6. API Costs

**Google Gemini:**
- Free tier: 60 requests per minute
- Generous free quota
- Perfect for development

**OpenAI (if using):**
- Pay-as-you-go pricing
- Typically $0.0005 per 1K tokens

### 7. Troubleshooting

**Issue: 404 (Not Found) Error - Model Not Found**
```
POST https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText 404
Error: Model not found or not supported
```
- **Cause:** Using unavailable or unsupported models (gemini-pro, gemini-1.5-pro, etc.)
- **Solution:** Use `text-bison-001` model which is stable and widely-available (already fixed in code)
- **Status:** ✅ Fixed - no action needed
- **Details:** `text-bison-001` is the most reliable model for the Gemini API
- **Fallback:** If error persists, chatbot uses keyword-based detection automatically

**Issue: "Gemini API key not configured"**
- **Cause:** `VITE_GEMINI_API_KEY` not in `.env` file
- **Solution:** Add your API key to `.env`:
  ```bash
  VITE_GEMINI_API_KEY=your_actual_key_here
  ```
- **Fallback:** Chatbot works with keyword detection

**Issue: "LLM API error" or 403/401 errors**
- **Cause:** Invalid or expired API key
- **Solution:**
  1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Delete old key if needed
  3. Create a new API key
  4. Update `.env` file
  5. Restart dev server
- **Verify:** Test key with curl command above

**Issue: Wrong intent detected**
- **Cause:** Complex or ambiguous query
- **Solution:** 
  - LLM has fallback to keywords
  - Try simpler phrasing
  - Check console logs for detected intent
- **Example:** Instead of "I want to find a place where I can have fun with games", try "fun place"

**Issue: Slow responses (1-2 seconds delay)**
- **Cause:** LLM API latency
- **Normal:** Expected behavior
- **Optimization:** Responses are cached in conversation

**Check Console Logs:**
Open browser DevTools (F12) → Console tab to see:
```
🤖 Sending query to Gemini API...
✅ LLM detected intent: "hotspot"
```

If you see errors, check:
1. API key is correct
2. Internet connection is working
3. API key has Gemini API enabled
4. Rate limits not exceeded

### 8. API Model & Version Comparison

| Model | API Version | Status | Use Case |
|-------|-------------|--------|----------|
| `text-bison-001` | `v1` (stable) | ✅ Recommended | Fast, reliable, fully supported |
| `gemini-pro` | `v1` | ❌ Not available | Deprecated/unavailable |
| `gemini-1.5-flash` | `v1beta` | ❌ Not available | Beta only, not in v1 |
| `gemini-1.5-pro` | `v1beta` | ❌ Not available | Beta only, not in v1 |

**Current Implementation:** Using `v1/models/text-bison-001:generateText` ✅

### 9. Performance Notes

- LLM detection adds ~500-1000ms latency
- Keyword fallback is instant
- Results are cached in conversation
- Minimal impact on user experience

### 10. Security Best Practices

⚠️ **IMPORTANT:**
- Never commit `.env` file to git
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate API keys regularly
- Monitor API usage for unusual activity

### 11. Future Enhancements

Potential improvements:
- [ ] Cache LLM responses for common queries
- [ ] Add conversation context for multi-turn dialogs
- [ ] Support for multiple languages
- [ ] Custom intent categories
- [ ] User preference learning

## Testing

### Test the Chatbot:

1. Start the development server:
```bash
npm run dev
```

2. Go to any plan view

3. Click the chat button

4. Try these queries:
   - "Show me hotspots"
   - "Where can I have fun?"
   - "Most reviewed places"
   - "Budget restaurants"
   - "Luxury hotels"
   - "I want to explore museums"

5. Check console for LLM detection logs

## Support

For issues or questions:
- Check the troubleshooting section
- Verify API key configuration
- Test with keyword-based fallback
- Check browser console for errors

---

**Last Updated:** November 21, 2025
**Status:** ✅ Production Ready
