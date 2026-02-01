# Job Scheduler Microservice

A production-ready job scheduler microservice built with NestJS, TypeScript, and PostgreSQL. This service allows scheduling and managing jobs with flexible configurations and automatic execution.

## 🚀 Features

- **Job Scheduling**: Custom scheduler with cron expression support
- **RESTful API**: Complete CRUD operations for job management
- **Database Integration**: PostgreSQL with Prisma ORM
- **Automatic Execution**: Jobs run automatically based on schedule
- **Validation**: Request validation using DTOs
- **Testing**: Comprehensive E2E tests with Jest
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Scalable Architecture**: Designed for high-performance production use

## 🛠️ Technology Stack

- **Language**: TypeScript
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v16 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
```bash
git clone 
cd schedular-microservice
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup PostgreSQL Database**
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE job_scheduler;
CREATE USER scheduler_user WITH ENCRYPTED PASSWORD 'postgres123';
GRANT ALL PRIVILEGES ON DATABASE job_scheduler TO scheduler_user;
GRANT ALL ON SCHEMA public TO scheduler_user;
ALTER SCHEMA public OWNER TO scheduler_user;
ALTER USER scheduler_user CREATEDB;
```

4. **Configure Environment Variables**

Create a `.env` file in the project root:
```bash
DATABASE_URL="postgresql://scheduler_user:postgres123@localhost:5432/job_scheduler?schema=public"
```

5. **Run Database Migrations**
```bash
npx prisma migrate deploy
npx prisma generate
```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```
<img width="1920" height="1006" alt="image" src="https://github.com/user-attachments/assets/7d9bbbb5-7153-42b6-850e-20ba3f54f27e" />


The server will start on `http://localhost:3000`

### Production Mode
```bash
npm run build
npm run start:prod
```

### Access Swagger Documentation
Open your browser and navigate to:
```
http://localhost:3000/api
```

## 🧪 Testing

### Run E2E Tests
```bash
# Setup test database
sudo -u postgres psql
CREATE DATABASE job_scheduler_test;
GRANT ALL PRIVILEGES ON DATABASE job_scheduler_test TO scheduler_user;

# Run tests
npm run test:e2e
```

### Run Unit Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:cov
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs` | List all jobs |
| GET | `/jobs/:id` | Get specific job details |
| POST | `/jobs` | Create a new job |
| PATCH | `/jobs/:id` | Update a job |
| DELETE | `/jobs/:id` | Delete a job |

<img width="1920" height="1006" alt="image" src="https://github.com/user-attachments/assets/6e7625c0-408a-4dce-9de3-53ead70763ff" />


### Example: Create a Job
```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Email Notification",
    "description": "Send daily newsletter to users",
    "schedule": "0 9 * * *",
    "isActive": true
  }'
```


### Cron Expression Examples

- `* * * * *` - Every minute
- `0 * * * *` - Every hour
- `0 9 * * *` - Every day at 9 AM
- `0 0 * * 0` - Every Sunday at midnight

## 🏗️ Architecture

### Project Structure
```
src/
├── jobs/                   # Jobs module
│   ├── dto/               # Data Transfer Objects
│   ├── jobs.controller.ts # API endpoints
│   ├── jobs.service.ts    # Business logic
│   └── jobs.module.ts     # Module definition
├── scheduler/             # Scheduler module
│   ├── jobs/             # Job implementations
│   ├── scheduler.service.ts # Scheduling logic
│   └── scheduler.module.ts
├── prisma.service.ts      # Database service
├── app.module.ts          # Root module
└── main.ts               # Application entry
```

### Design Patterns Used

- **Factory Pattern**: Job creation (JobFactory)
- **Repository Pattern**: Database operations (Prisma)
- **Dependency Injection**: Service composition
- **Strategy Pattern**: Different job implementations
- **Module Pattern**: Feature organization

## 📊 Database Schema
```prisma
model Job {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  schedule    String    // Cron expression
  isActive    Boolean   @default(true)
  lastRun     DateTime?
  nextRun     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@map("jobs")
}
```

## ⚙️ How It Works

1. **Job Creation**: Users create jobs via REST API with cron schedules
2. **Scheduler Service**: Runs every minute checking for jobs to execute
3. **Job Execution**: When it's time, the scheduler executes the job logic
4. **Timestamp Updates**: Updates `lastRun` and calculates `nextRun`
5. **Database Persistence**: All job data stored in PostgreSQL

## 🔒 Validation

All API requests are validated using DTOs:
- Job name is required
- Schedule must be a valid string
- Optional fields: description, isActive



## 📈 Scalability

The application is designed for scalability:

- **Database Connection Pooling**: Prisma with pg adapter
- **Stateless Design**: Can scale horizontally
- **Modular Architecture**: Easy to separate into microservices
- **Efficient Queries**: Database indexing ready
- **Async Operations**: Non-blocking job execution

### Scaling to 10,000+ Users

## 🧪 Testing Coverage

<img width="1920" height="1006" alt="image" src="https://github.com/user-attachments/assets/b3f05d03-4643-4dc5-b8b5-2688b767ec31" />

- ✅ API endpoint testing
- ✅ Database integration testing
- ✅ Validation testing
- ✅ Job creation and retrieval
- ✅ Job execution flow

## Conclusion

The current architecture is **production-ready** and can scale to meet requirements:

✅ **10,000 users**: Use 6 instances behind load balancer  
✅ **1,000 services**: Modular design supports service separation  
✅ **6,000 API requests/min**: 6 instances @ 1K req/min each  
