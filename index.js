const { Worker, Queue } = require("bullmq");
const Redis = require("ioredis");

const redis = new Redis("redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const concurrency = process.argv[2] ? parseInt(process.argv[2], 10) : 1;

let count = 0;
const worker = new Worker("myQueue", async () => {
  const [isRateLimited, duration] = await doSomething(); // always returns true
  count += 1;
  if (isRateLimited) {
    console.log(`rate limited ${duration}ms (run time = ${Date.now()} count = ${count})`);
    await worker.rateLimit(duration);
    throw Worker.RateLimitError();
  }
  console.log("done! (you won't see this)"); // never reaches this point
}, {
  connection: redis,
  // NOTE: toggling this between 1 and 4 results in different behavior
  concurrency: concurrency,
});

async function doSomething() {
  console.log("doing something...");
  await new Promise((resolve) => setTimeout(() => resolve(null), 500));
  // pretending im a job that fails and should rate limiting for 20s
  return [true, 5_000];
}

setTimeout(() => {
  const queue = new Queue("myQueue", { connection: redis });
  console.log("ADDING JOB TO QUEUE");
  queue.add("someJob", { foo: "bar" }, {
    attempts: 1,
    jobId: "someJob",
  });
}, 500);


