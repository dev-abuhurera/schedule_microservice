import { JobExecutor } from "../job-executor.interface";

export class EmailJob implements JobExecutor {
    async execute(jobId: Number, jobName: String): Promise<void> {
        console.log(`Executing email [job ${jobId}] - ${jobName} - sending email`);

        await this.delay(2000);

        console.log(`Email [job ${jobId}] - ${jobName} - email sent`);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}