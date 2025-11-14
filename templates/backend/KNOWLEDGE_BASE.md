# Knowledge Base Setup

The knowledge base feature allows you to make your chatbot product-specific by providing it with accurate, company-specific information. This prevents hallucinations and ensures the AI only answers using verified information.

## How It Works

1. **User asks a question** → "How long do refunds take?"
2. **System searches knowledge base** → Finds relevant FAQs using keyword matching
3. **Injects into AI prompt** → Adds relevant information to the system prompt
4. **AI responds accurately** → Only uses knowledge base information, no hallucinations

## File Structure

```
templates/backend/
├── knowledge-base.json    # Your product-specific Q&A data
└── knowledge.ts          # Search logic (no need to modify)
```

## Customizing the Knowledge Base

### 1. Edit `knowledge-base.json`

This is the only file you need to customize. It contains all your product-specific information.

```json
{
  "company": "Your Company Name",
  "description": "Customer support knowledge base",
  "faqs": [
    {
      "category": "refunds",
      "question": "How long do refunds take?",
      "answer": "Refunds are processed within 10 business days...",
      "keywords": ["refund", "money back", "return", "reimbursement"]
    }
  ]
}
```

### 2. FAQ Structure

Each FAQ has four fields:

#### `category` (string)
- Groups related FAQs together
- Examples: "refunds", "shipping", "account", "technical", "pricing"
- Used for organization (not for searching)

#### `question` (string)
- The question this FAQ answers
- Make it clear and specific
- Example: "What is your return policy?"

#### `answer` (string)
- The complete answer to provide to users
- Can include multiple lines using `\n`
- Be specific and accurate
- Include step-by-step instructions if applicable

#### `keywords` (array of strings)
- Words/phrases users might use when asking about this topic
- More keywords = better matching
- Include synonyms and common variations
- Examples:
  - For refunds: `["refund", "money back", "return", "reimbursement", "payment back"]`
  - For shipping: `["shipping", "delivery", "tracking", "when will it arrive", "ship"]`
  - For password reset: `["password", "reset", "forgot password", "login", "can't log in"]`

### 3. Tips for Good Keywords

**✅ DO:**
- Include common misspellings
- Add synonyms ("buy" and "purchase")
- Include casual language ("stuff broke" for "defective product")
- Use multiple word phrases ("money back", "get refund")
- Think about how users actually talk

**❌ DON'T:**
- Use only technical jargon
- Forget common abbreviations (e.g., "FAQ", "Q&A")
- Ignore context-specific terms

### 4. Example: Adding a New FAQ

Let's add an FAQ about gift cards:

```json
{
  "category": "payment",
  "question": "Can I use multiple gift cards on one order?",
  "answer": "Yes! You can use up to 5 gift cards per order. During checkout:\n1. Enter the first gift card code and click 'Apply'\n2. Enter additional gift card codes one at a time\n3. The balance will be deducted in the order they were added\n\nAny remaining balance can be paid with a credit card.",
  "keywords": [
    "gift card",
    "gift cards",
    "multiple gift cards",
    "combine gift cards",
    "more than one gift card",
    "several gift cards",
    "payment",
    "how many gift cards"
  ]
}
```

## Testing Your Knowledge Base

After adding or modifying FAQs:

1. **Restart your development server**
   ```bash
   npm run dev
   ```

2. **Test with different phrasings**
   - Try: "How long does a refund take?"
   - Try: "When will I get my money back?"
   - Try: "Refund processing time?"

3. **Check for gaps**
   - If the AI can't answer, add more keywords or create a new FAQ
   - Review the AI's responses to ensure accuracy

## Advanced Configuration

### Adjusting Search Sensitivity

In `knowledge.ts`, you can modify these parameters:

```typescript
searchKnowledgeBase(
  userMessage: string,
  maxResults: number = 3,      // Max FAQs to return
  minScore: number = 5          // Minimum relevance score
)
```

**To make matching more strict:**
- Increase `minScore` (e.g., to 8 or 10)
- Only very relevant FAQs will be included

**To make matching more lenient:**
- Decrease `minScore` (e.g., to 3)
- More FAQs will be included, but may be less relevant

### System Prompt Integration

The knowledge base is automatically injected into your system prompt. You can modify the base system prompt in your `.env` file:

```
ANTHROPIC_SYSTEM_PROMPT="You are a helpful customer support assistant for [Your Company]. Be friendly and professional."
```

The knowledge base information is appended automatically when relevant FAQs are found.

## Best Practices

1. **Keep answers concise but complete**
   - Aim for 2-4 sentences per answer
   - Include specific details (numbers, timeframes, steps)

2. **Update regularly**
   - Add new FAQs as you receive common questions
   - Update answers when policies change

3. **Organize by category**
   - Makes maintenance easier
   - Helps you identify gaps

4. **Test edge cases**
   - Misspellings
   - Unusual phrasing
   - Partial matches

5. **Don't duplicate information**
   - If two questions have the same answer, combine them
   - Or reference one from the other

## Troubleshooting

### "The AI isn't using my knowledge base"

- Check that `knowledge-base.json` is valid JSON (no syntax errors)
- Verify keywords match what users are actually typing
- Increase the number of keywords for better matching
- Lower the `minScore` threshold

### "The AI gives wrong information"

- Review the `answer` field in your FAQ
- Make sure it's accurate and up-to-date
- Check that the right FAQ is being matched (test keywords)

### "Too many irrelevant FAQs are being matched"

- Increase the `minScore` threshold
- Make keywords more specific
- Reduce keyword overlap between FAQs

## Example Knowledge Bases

### E-commerce Store
- Shipping times and tracking
- Return and refund policies
- Product availability
- Payment methods
- Gift cards and promotions

### SaaS Product
- Account management
- Billing and subscriptions
- Feature documentation
- Technical requirements
- API usage and limits

### Service Business
- Booking and scheduling
- Cancellation policies
- Pricing and packages
- Service areas
- Contact information

---

**Need Help?** Review the example FAQs in `knowledge-base.json` to see the structure and keyword strategy in action.
