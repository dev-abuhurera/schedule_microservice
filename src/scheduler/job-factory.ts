// it will be used to create a job instance based on the job name

import { JobExecutor } from "./job-executor.interface";
import { EmailJob } from "./jobs/email-job";

export class JobFactory {
    static createJob(jobName: string): JobExecutor {
        // on the base of the job name, it will return the corresponding job instance
        if(jobName.toLowerCase().includes('email')) {
            return new EmailJob();
        }else {
            throw new Error(`Unknown job name: ${jobName}`);
        }
    }
}