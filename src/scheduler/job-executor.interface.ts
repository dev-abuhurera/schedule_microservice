export interface JobExecutor {
    execute(jobId: Number, jobName: String): Promise<void>;
} // every job must implement this interface