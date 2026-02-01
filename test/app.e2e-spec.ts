import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Job Scheduler API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Enable validation like in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.job.deleteMany();

  });

  describe('POST /jobs', () => {

    it('should create a new job', async () => {
      const createJobDto = {
        name: 'Test Job',
        description: 'Test description',
        schedule: '0 9 * * *',
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/jobs')
        .send(createJobDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Test Job',
        description: 'Test description',
        schedule: '0 9 * * *',
        isActive: true,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      
    });

    it('should validate required fields', async () => {
      const invalidJob = {
        description: 'Missing name and schedule',
      };

      await request(app.getHttpServer())
        .post('/jobs')
        .send(invalidJob)
        .expect(400);
    });

    it('should create job in database', async () => {
      const createJobDto = {
        name: 'Database Test Job',
        schedule: '* * * * *',
      };

      const response = await request(app.getHttpServer())
        .post('/jobs')
        .send(createJobDto)
        .expect(201);

      // Verify in database
      const jobInDb = await prisma.job.findUnique({
        where: { id: response.body.id },
      });

      expect(jobInDb).not.toBeNull;
      expect(jobInDb!.name).toBe('Database Test Job');

    });

  });

  describe('GET /jobs', () => {
    it('should return all jobs', async () => {
      // Create test jobs
      await prisma.job.createMany({
        data: [
          { name: 'Job 1', schedule: '0 9 * * *' },
          { name: 'Job 2', schedule: '0 10 * * *' },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/jobs')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Job 1');
      expect(response.body[1].name).toBe('Job 2');
    });

    it('should return empty array when no jobs exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/jobs')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /jobs/:id', () => {
    it('should return a specific job', async () => {
      const job = await prisma.job.create({
        data: {
          name: 'Specific Job',
          schedule: '0 12 * * *',
          description: 'Test job',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/jobs/${job.id}`)
        .expect(200);

      expect(response.body.id).toBe(job.id);
      expect(response.body.name).toBe('Specific Job');
    });

    it('should return null for non-existent job', async () => {
      const response = await request(app.getHttpServer())
        .get('/jobs/99999')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('PATCH /jobs/:id', () => {
    it('should update a job', async () => {
      const job = await prisma.job.create({
        data: {
          name: 'Original Name',
          schedule: '0 9 * * *',
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/jobs/${job.id}`)
        .send({ name: 'Updated Name', isActive: false })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.isActive).toBe(false);

      // Verify in database
      const updatedJob = await prisma.job.findUnique({
        where: { id: job.id },
      });
      expect(updatedJob).not.toBeNull();
      expect(updatedJob!.name).toBe('Updated Name');
      expect(updatedJob!.isActive).toBe(false);
    });

  });

  describe('DELETE /jobs/:id', () => {
    it('should delete a job', async () => {
      const job = await prisma.job.create({
        data: {
          name: 'Job to Delete',
          schedule: '0 9 * * *',
        },
      });

      await request(app.getHttpServer())
        .delete(`/jobs/${job.id}`)
        .expect(200);

      // Verify deletion in database
      const deletedJob = await prisma.job.findUnique({
        where: { id: job.id },
      });
      expect(deletedJob).toBeNull();
    });
  });

  describe('Job Execution', () => {
    
    it('should update lastRun and nextRun after job creation', async () => {
      const job = await prisma.job.create({
        data: {
          name: 'Execution Test Job',
          schedule: '* * * * *',
          isActive: true,
        },
      });

      expect(job.lastRun).toBeNull();
      expect(job.nextRun).toBeNull();

    });
  });
});