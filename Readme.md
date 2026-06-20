
# 🤖 CodePulse - AI Code Review Platform
 
A backend system that reviews your code using AI. You paste code, it tells you what's wrong, how bad it is, and how to fix it — with exact line numbers.

**Live URL:** `https://codepulse-production-0644.up.railway.app`
---
 
## The idea
 
Ever wished you had a senior engineer reviewing your code 24/7? That's what this does.
 
You submit code → it goes into a queue → a background worker sends it to an AI → you get back a detailed review with:
- An overall quality score (0–100)
- A summary of the main problems
- Line-by-line issues with severity (critical / warning / suggestion)
- Exact fix suggestions for each issue
---
 
## How it works (simple version)
 
```
You send code
     ↓
Server saves it and says "got it!" immediately (no waiting)
     ↓
Background worker picks it up
     ↓
AI reads your code and finds problems
     ↓
Results saved to database
     ↓
You fetch the review whenever you want
```
 
The "no waiting" part is the key — the server doesn't block while AI thinks. It queues the job and responds in under 50ms every time.
 
---
 
## Example
 
You submit this Python code:
```python
def add(a, b):
    return a + b
```
 
You get back:
```json
{
  "score": 62,
  "summary": "The function works but is missing type hints, input validation, and a docstring. Not production-ready.",
  "issues": [
    {
      "lineStart": 1,
      "lineEnd": 1,
      "severity": "warning",
      "category": "correctness",
      "description": "No input validation — passing strings will silently concatenate instead of erroring",
      "fix": "Add type hints: def add(a: float, b: float) -> float:"
    },
    {
      "lineStart": 1,
      "lineEnd": 2,
      "severity": "suggestion",
      "category": "style",
      "description": "Missing docstring",
      "fix": "Add: \"\"\"Returns the sum of a and b.\"\"\""
    }
  ]
}
```
 
---
 
## Tech stack
 
| What | Technology |
|---|---|
| Language | TypeScript (strict) |
| Server | Node.js 20 + Express |
| Database | PostgreSQL + Prisma ORM |
| Cache + Queue | Redis + BullMQ |
| AI | Groq (Llama 3.3 70B) |
| Resilience | opossum circuit breaker |
| Auth | JWT (access + refresh tokens) |
| Validation | Zod |
| Deploy | Railway |
 
---
 
## API
 
All endpoints except `/auth/*` need `Authorization: Bearer <token>` header.
 
| Method | URL | What it does |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, get tokens |
| POST | `/auth/refresh` | Get new access token |
| POST | `/reviews` | Submit code for review |
| GET | `/reviews` | List your reviews |
| GET | `/reviews/:id` | Get one review with issues |
| GET | `/health` | Check if server is alive |
 
---
 
## Local setup
 
You need Node.js 20+ and Docker Desktop installed.
 
```bash
# 1. clone
git clone https://github.com/your-username/ai-code-review.git
cd ai-code-review
 
# 2. install dependencies
npm install
 
# 3. copy env file and fill in your values
cp .env.example .env
 
# 4. start postgres and redis
docker-compose up -d
 
# 5. create database tables
npx prisma migrate dev
 
# 6. start the server
npm run dev
```
 
Server runs at `http://localhost:3000`
 
---
 
## Environment variables
 
```env
PORT=3000
NODE_ENV=development
 
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_review"
REDIS_URL="redis://localhost:6379"
 
JWT_SECRET="min-32-characters-random-string-here"
JWT_REFRESH_SECRET="different-min-32-characters-string"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
 
GROQ_API_KEY="gsk_your_groq_key"
GITHUB_WEBHOOK_SECRET="your_webhook_secret"
```
 
Get a free Groq API key at [console.groq.com](https://console.groq.com)
 
---
 
## Testing
 
### Run automated tests
```bash
npm test
```
 
### Manual test with curl
 
**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"secret123"}'
```
 
**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"secret123"}'
```
 
**Submit code for review:**
```bash
curl -X POST http://localhost:3000/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"def add(a,b): return a+b","language":"python"}'
```
 
**Fetch result (wait 5-10 seconds first):**
```bash
curl http://localhost:3000/reviews/REVIEW_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
 
### Test checklist
- [ ] `POST /auth/register` — returns tokens
- [ ] `POST /auth/register` again — returns "Email already registered"
- [ ] `POST /auth/login` with wrong password — returns "Invalid email or password"
- [ ] `GET /reviews` without token — returns 401
- [ ] `POST /reviews` with bad language — returns 400 with field errors
- [ ] `POST /reviews` 11 times — 11th returns 429 rate limit error
- [ ] `GET /reviews/:id` after 10s — returns score, summary, issues
---
 
## Project structure
 
```
src/
├── ai/
│   ├── openaiGateway.ts   # Groq API call + circuit breaker
│   ├── pipeline.ts        # Connects all 4 AI stages
│   ├── promptBuilder.ts   # Builds the review prompt
│   └── responseParser.ts  # Parses AI JSON response
│
├── config/
│   ├── env.ts             # Zod validated env vars — crashes fast if missing
│   ├── prisma.ts          # Database client singleton
│   └── redis.ts           # Redis client
│
├── middleware/
│   ├── authenticate.ts    # JWT verification
│   ├── rateLimiter.ts     # 10 reviews/hour per user (Redis sliding window)
│   └── validate.ts        # Zod request body validation
│
├── queues/
│   ├── review.queue.ts    # BullMQ queue — where jobs are added
│   └── review.worker.ts   # Background worker — processes jobs
│
├── routes/
│   ├── auth.routes.ts     # /auth endpoints
│   └── review.routes.ts   # /reviews endpoints
│
├── services/
│   ├── auth.service.ts    # Register, login, refresh logic
│   └── review.service.ts  # Review CRUD
│
├── types/
│   └── express.d.ts       # Adds req.user to Express types
│
├── app.ts                 # Express setup
└── server.ts              # Entry point
```
 
---
 
## Interesting engineering decisions
 
**Why is the HTTP response immediate?**
The review endpoint returns 202 in under 50ms regardless of how long AI takes. The actual processing happens in a BullMQ background worker. This means the server can handle hundreds of concurrent submissions without any thread blocking.
 
**What happens if Groq goes down?**
A circuit breaker (opossum) wraps every AI call. After 3 failures it "opens" — meaning subsequent calls fail immediately instead of waiting 30 seconds for a timeout. After 30 seconds it probes once. If Groq is back, the circuit closes. Jobs stay in the queue and retry automatically with exponential backoff.
 
**How does rate limiting work?**
Redis sorted sets — each request is stored with a timestamp as the score. On every request, entries older than 1 hour are removed, then we count what's left. If it's over 10, we return 429. This is called a sliding window and it's more accurate than a fixed window approach.
 
---
 
## Future scope
 
Things I plan to add:
 
**Short term**
- [ ] GitHub webhook — auto-review code when a PR is opened, post inline comments back
- [ ] SSE streaming — stream AI review tokens to client in real time as they arrive
- [ ] Shareable review links — public read-only view via UUID
## What I learned building this
 
- How to decouple HTTP response time from processing time using async queues
- Why circuit breakers matter when calling external APIs
- How Redis sorted sets work for sliding window rate limiting
- How to structure prompts to get consistent JSON output from LLMs
- How Prisma handles nested creates (saving review + all issues in one query)
---

 
*If this helped you, give it a ⭐*
