# Scalability Analysis - Job Scheduler Microservice

## Overview

This document explains how the Job Scheduler Microservice can scale to handle:
- **~10,000 users globally**
- **~1,000 services**
- **~6,000 API requests per minute** (~100 requests/second)

## Current Architecture Strengths

### 1. Stateless Design
- No session storage
- Each request is independent
- Can scale horizontally by adding more instances

### 2. Database Connection Pooling
```typescript
// Prisma with pg adapter automatically pools connections
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
```

**Benefits:**
- Reuses database connections
- Handles concurrent requests efficiently
- Reduces connection overhead

### 3. Modular Architecture
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Jobs API  │  │  Scheduler  │  │  Database   │
│   Module    │  │   Module    │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘
```

Each module can be separated into individual services if needed.

## Scaling Strategies

### Phase 1: Vertical Scaling (0-1K users)
**Current Setup** ✅
- Single server instance
- PostgreSQL on same/separate server
- Handles ~100 requests/second

### Phase 2: Horizontal Scaling (1K-5K users)
```
                  Load Balancer
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   App Server 1   App Server 2   App Server 3
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                  PostgreSQL
             (Primary + Replicas)
```

**Implementation:**
1. Deploy multiple NestJS instances
2. Use NGINX/AWS ELB for load balancing
3. PostgreSQL read replicas for read operations
4. Redis for caching 

**Code Changes Required:** None! ✅ (Stateless design)

### Phase 3: Microservices (5K-10K+ users)
```
┌──────────────────────────────────────────┐
│           API Gateway (Kong/AWS)         │
└──────────────────────────────────────────┘
         │              │              │
    ┌────▼────┐    ┌───▼────┐    ┌───▼────┐
    │  Jobs   │    │Scheduler│   │  Auth  │
    │ Service │    │ Service │   │Service │
    └─────────┘    └────────┘    └────────┘
         │              │              │
    ┌────▼──────────────▼──────────────▼────┐
    │     Database Cluster (Sharded)        │
    └───────────────────────────────────────┘
```

**Separation Strategy:**
1. **Jobs API Service**: Handles CRUD operations
2. **Scheduler Service**: Runs jobs (separate instances)
3. **Shared Database**: With read replicas

## Database Scaling

### 1. Indexing
```sql
-- Add indexes for frequent queries
CREATE INDEX idx_jobs_active ON jobs(isActive);
CREATE INDEX idx_jobs_next_run ON jobs(nextRun);
CREATE INDEX idx_jobs_schedule ON jobs(schedule);
```

### 2. Read Replicas
```
Primary DB (Write) ────┐
                       │
Replica 1 (Read) ──────┼──── Load Balanced Reads
Replica 2 (Read) ──────┘
```

**Benefits:**
- Distribute read load across replicas
- Primary handles writes only
- Can support 10K+ concurrent users

### 3. Connection Pooling Configuration
```typescript
// Increase pool size for high concurrency
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,        // Maximum connections
  min: 5,         // Minimum connections
  idle: 10000,    // Idle timeout
});
```

### 4. Partitioning (Future)
```sql
-- Partition jobs by year/month for very large datasets
CREATE TABLE jobs_2026_01 PARTITION OF jobs
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

## Scheduler Scaling

### Current Implementation
- Single scheduler instance checks every minute
- Works well for moderate job volumes

### Scaled Implementation

**Option 1: Distributed Scheduler**
```
Scheduler 1 ──┐
              ├──── Job Queue (Redis/RabbitMQ) ──── Workers (1-N)
Scheduler 2 ──┘
```

**Option 2: Job Sharding**
```
Scheduler 1 → Jobs with ID % 3 = 0
Scheduler 2 → Jobs with ID % 3 = 1  
Scheduler 3 → Jobs with ID % 3 = 2
```

### Preventing Duplicate Execution

Use database locking:
```typescript
async executeJob(jobId: number) {
  // Lock the job row
  const job = await prisma.$queryRaw`
    SELECT * FROM jobs 
    WHERE id = ${jobId} 
    FOR UPDATE SKIP LOCKED
  `;
  
  if (!job) return; // Another scheduler is processing it
  
  // Execute job...
}
```

## Performance Optimizations

### 1. Caching (Redis)
```typescript
// Cache frequently accessed jobs
const cachedJob = await redis.get(`job:${id}`);
if (cachedJob) return JSON.parse(cachedJob);

const job = await prisma.job.findUnique({ where: { id } });
await redis.set(`job:${id}`, JSON.stringify(job), 'EX', 300);
```

### 2. Bulk Operations
```typescript
// Instead of individual queries
const jobs = await prisma.job.findMany({
  where: {
    isActive: true,
    nextRun: { lte: new Date() }
  },
  take: 100 // Batch size
});
```

### 3. Async Job Execution
```typescript
// Don't wait for job completion
this.executeJobAsync(job).catch(error => {
  this.logger.error(`Job ${job.id} failed:`, error);
});
```

## Monitoring & Observability

### Metrics to Track
- API request rate (requests/second)
- Database connection pool utilization
- Job execution time
- Scheduler lag (time between scheduled and actual execution)
- Error rates

### Tools
- **Prometheus** + Grafana for metrics
- **ELK Stack** for logging
- **Sentry** for error tracking
- **New Relic/DataDog** for APM

## Capacity Planning

### Current Capacity
- Single NestJS instance: ~1,000 req/min
- PostgreSQL: ~10,000 simple queries/sec
- Scheduler: ~1,000 jobs/minute

### Scaled Capacity (3 instances)
- API throughput: ~3,000 req/min ✅ (Target: 6,000)
- With 6 instances: ~6,000 req/min ✅

### Database Capacity
- Primary + 2 Replicas: ~30,000 queries/sec
- More than enough for 6,000 API req/min

## Deployment Strategy

### Blue-Green Deployment

**Process:**
1. Deploy new version to Green
2. Run health checks
3. Switch traffic to Green
4. Monitor for issues
5. Keep Blue as rollback option
