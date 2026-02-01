import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobService: JobsService) {}

    @Post()
    create(@Body() CreateJobDto: CreateJobDto) {
        return this.jobService.create(CreateJobDto);
    }

    @Get()
    findAll(){
        return this.jobService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.jobService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id:string, @Body() updateJobDto: UpdateJobDto){
        return this.jobService.update(+id, updateJobDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string){
        return this.jobService.remove(+id);
    }
    
}
