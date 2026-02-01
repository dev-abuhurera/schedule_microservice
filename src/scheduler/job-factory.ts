// it will be used to create a job instance based on the job name

import { JobExecutor } from "./job-executor.interface";
import { EmailJob } from "./jobs/email-job";

export class JobFactory {
    static createJob(jobName: string): JobExecutor {

        const name = jobName.toLowerCase();
        // on the base of the job name, it will return the corresponding job instance
        if (name.includes('email') || 
        name.includes('notification') || 
        name.includes('send')) {
        return new EmailJob();
        } 

        return new EmailJob();
    }
}