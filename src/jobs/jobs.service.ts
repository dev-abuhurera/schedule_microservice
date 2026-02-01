import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        name: createJobDto.name,
        description: createJobDto.description || null,
        schedule: createJobDto.schedule,
        isActive: createJobDto.isActive !== undefined ? createJobDto.isActive : true,
      },
    });
  }

  async findAll() {
    return this.prisma.job.findMany();
  }

  async findOne(id: number) {
    return this.prisma.job.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const updateData: any = {};
    
    if (updateJobDto.name !== undefined) updateData.name = updateJobDto.name;
    if (updateJobDto.description !== undefined) updateData.description = updateJobDto.description;
    if (updateJobDto.schedule !== undefined) updateData.schedule = updateJobDto.schedule;
    if (updateJobDto.isActive !== undefined) updateData.isActive = updateJobDto.isActive;
    
    return this.prisma.job.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    return this.prisma.job.delete({
      where: { id },
    });
  }

}