# Database Pooling for Cloud Deployments

PhiloMind uses Prisma against PostgreSQL/Supabase. Local development can look healthy while cloud deployments fail because cloud runtime has higher latency, lower practical connection limits, and more concurrent requests.

## Required Cloud Shape

Use the Supabase transaction pooler URL for `DATABASE_URL` on hosted backends. Do not use the direct database URL for a public web service that can receive concurrent traffic.

Recommended starting point for one backend instance:

```bash
PRISMA_CONNECTION_LIMIT=5
PRISMA_POOL_TIMEOUT=60
PRISMA_CONNECT_TIMEOUT=30
PRISMA_TRANSACTION_MAX_WAIT_MS=20000
PRISMA_TRANSACTION_TIMEOUT_MS=60000
DB_QUERY_CONCURRENCY=5
DB_QUEUE_TIMEOUT_MS=30000
```

If the backend runs more than one replica, calculate:

```text
replicas * PRISMA_CONNECTION_LIMIT <= effective Supabase pool size
```

For example, with pool size 15 and three backend replicas, use `PRISMA_CONNECTION_LIMIT=5`. If requests are still queued too long, scale the pool/DB plan or add app replicas with a matching per-replica limit; setting the limit to `1` or `2` usually prevents max-connection errors but can cause Prisma `P2024` under lesson/progress bursts.

## Application Guards

The backend also has an application-level DB query queue. It keeps excess work outside Prisma's internal pool and returns a controlled `503` when the server is saturated instead of letting every request compete for the same small pool.

These settings should normally track the Prisma limit:

```text
DB_QUERY_CONCURRENCY <= PRISMA_CONNECTION_LIMIT
DB_QUEUE_TIMEOUT_MS = 30000
```

The service clamps `DB_QUERY_CONCURRENCY` to `PRISMA_CONNECTION_LIMIT` at runtime. This keeps excess work in the NestJS queue instead of pushing it into Prisma's internal pool, which is the path that commonly ends in `P2024` when the pool is intentionally small.

## Query Load Reductions

The learner app sends many protected requests around lesson load, node progress, quizzes, documents, topics, and flashcards. The backend reduces pressure by:

- using a lean auth lookup for JWT validation instead of loading user progress/reviews on every request;
- caching read-mostly public data such as quizzes, debate topics, documents, warmups, and Philosofun for short TTL windows;
- using `upsert`/atomic updates for progress and flashcard review writes;
- adding indexes for frequent progress, review, debate, and hierarchy filters in `backend/prisma/schema.prisma`.

After deploying schema changes, apply the Prisma schema to the database:

```bash
cd backend
npx prisma db push
```
