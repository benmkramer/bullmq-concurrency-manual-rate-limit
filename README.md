# BullMQ Manual Rate Limiting w/ Concurrency

Related to ticket https://github.com/taskforcesh/bullmq/issues/1571 that I found while trying to use bullmq manual rate limiting, I had found that it did not seem to work as I expected.

Not clear yet if this is a misunderstanding on my part or an issue with BullMQ itself.

## Setup

I am running node v18.15.0 and the bullmq/ioredis versions as seen in package-lock.json

## Testing

I have been trying with various concurrency level. Before each run I clear out redis to ensure no side-effect of prior jobs left in the queue.
`redis-cli flushdb && node index.js 4` for example, to clear redis and run this script with a concurrency of 4.

At concurrency **1** it seems to work as I expect. The job runs and each time it rate limits itself for 5s, and then I see a new one run 5s later.

However, when concurrency is **larger than 1**, then I see that it runs the job continuously, seeming to not respect the rate limit.
For example, a run with concurrency 4 looks like the following... Notice that each run is about 500ms apart, based on the wait time in `doSomething`

```
ADDING JOB TO QUEUE
doing something...
rate limited 5000ms (run time = 1683390728230 count = 1)
doing something...
rate limited 5000ms (run time = 1683390728737 count = 2)
doing something...
rate limited 5000ms (run time = 1683390729243 count = 3)
doing something...
rate limited 5000ms (run time = 1683390729748 count = 4)
doing something...
rate limited 5000ms (run time = 1683390730254 count = 5)
doing something...
rate limited 5000ms (run time = 1683390730758 count = 6)
doing something...
rate limited 5000ms (run time = 1683390731264 count = 7)
```

