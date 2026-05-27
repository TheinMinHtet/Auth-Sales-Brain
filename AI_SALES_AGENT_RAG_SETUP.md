# AI Sales Agent RAG Setup

This guide is for the public selling link only:

- `/shop/[shopId]`
- `/api/chat`

It explains how this project uses:

- Gemini API for all AI inference
- Supabase Postgres + pgvector for RAG
- backend tools for live product, stock, and order actions

## Architecture

Customer message flow:

1. Customer opens the public shop link.
2. Customer sends a message in the shop chatbot.
3. `src/app/api/chat/route.ts` loads the shop and recent chat history.
4. The backend retrieves top matching knowledge documents from Supabase pgvector.
5. Gemini receives:
   - the user message
   - the recent chat history
   - retrieved business context
   - available backend tools
6. Gemini either:
   - answers directly from grounded context
   - calls a backend tool
   - gets the tool result back
   - then returns the final answer
7. The final answer is returned to the public shop chat UI.

## Files Used By The RAG Agent

- `src/app/api/chat/route.ts`
- `src/lib/ai/chat.ts`
- `src/lib/ai/gemini.ts`
- `src/lib/ai/knowledge.ts`
- `src/lib/ai/tools.ts`
- `src/lib/supabase/admin.ts`
- `supabase/migrations/20260527_ai_sales_agent.sql`

## Environment Variables

Add these to `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-3.5-flash"
GEMINI_EMBEDDING_MODEL="gemini-embedding-001"

DEVELOPER_EMAIL="admin@platform.dev"
```

## Step 1: Install And Run The App

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Step 2: Enable pgvector In Supabase

Open your Supabase project:

1. Go to `SQL Editor`
2. Open `supabase/migrations/20260527_ai_sales_agent.sql`
3. Run the SQL

That migration creates:

- `shop_knowledge_documents`
- a vector index
- `match_shop_knowledge(...)`

## Step 3: Create A Shop From The App

Use the normal shop setup flow:

1. Sign in
2. Open `/setup`
3. Create the shop and products

After setup, the backend will try to build knowledge documents automatically from:

- business info
- payment and delivery info
- FAQ and policies
- active products

## Step 4: How Knowledge Is Stored

Each shop gets knowledge chunks like:

- shop overview
- payment and delivery
- faq and policies
- one document per active product

Each chunk is embedded with Gemini embeddings and stored in Supabase with its vector.

## Step 5: How RAG Runs At Chat Time

When a user sends a message:

1. `src/lib/ai/chat.ts` asks Supabase for top matching documents.
2. If no documents are found, it tries to sync the shop knowledge once.
3. If the question is product-related and still no context is found, the bot returns:

```text
I don't have enough information
```

4. If context exists, Gemini gets:
   - retrieved context
   - conversation history
   - available tools

## Step 6: Backend Tools Available To Gemini

The agent can call these server-side tools:

- `search_products(query)`
- `get_product_details(product_id)`
- `check_stock(product_id)`
- `create_order(user_id, product_id, quantity, customer_name?, customer_email?, customer_phone?, address?)`
- `track_order(order_id)`

Important:

- prices are taken from the database
- stock is taken from the database
- order tracking is taken from the database
- the model should not guess missing values

## Step 7: How To Refresh RAG Data

RAG sync is triggered automatically when:

- a shop is created
- a product is created
- a product is updated
- a product is deleted

So in normal use, you do not need a separate manual RAG job.

## Step 8: How To Test It

Open the public generated link:

```text
http://localhost:3000/shop/YOUR_SHOP_ID
```

Then test these messages:

### Product Retrieval

```text
What products do you sell?
```

### Product Recommendation

```text
Recommend something under $20
```

### Live Stock Check

```text
Is the blue bottle still in stock?
```

### Product Detail Question

```text
Tell me more about Product Name
```

### Order Tracking

```text
Track my order ORDER_ID
```

### Missing Context Safety

```text
What is the warranty policy for your laptop?
```

If that information is not in RAG or tool results, the agent should not guess.

## Step 9: Production Deploy

On Vercel, make sure these are added:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_APP_URL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_EMBEDDING_MODEL`

Also run the pgvector SQL in the production Supabase project before using chat.

## Troubleshooting

### Chat says "I don't have enough information"

Check:

- the SQL migration was run
- `SUPABASE_SERVICE_ROLE_KEY` is set
- `GEMINI_API_KEY` is set
- the shop has products or business content

### Product changes are not reflected

Check server logs for:

- `Knowledge sync failed after shop setup`
- `Knowledge sync failed after product create`
- `Knowledge sync failed after product update`
- `Knowledge sync failed after product delete`

### AI is not using local models

That is expected.

This implementation is cloud-only:

- Gemini API for generation and embeddings
- Supabase for long-term knowledge
- backend APIs for actions

## Recommended Workflow

For each new shop:

1. Set env vars
2. Run Prisma setup
3. Run the Supabase pgvector SQL
4. Create the shop in `/setup`
5. Open the generated `/shop/[shopId]` link
6. Test product questions, stock checks, and order tracking
