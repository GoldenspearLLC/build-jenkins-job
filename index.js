const core = require("@actions/core");
const jenkins = require("jenkins");

(async () => {
  const jenkinsUrl = new URL(core.getInput("jenkins-url", { required: true }));
  jenkinsUrl.username = core.getInput("user", { required: true });
  jenkinsUrl.password = core.getInput("jenkins-token", { required: true });

  const jenkinsClient = jenkins({
    baseUrl: jenkinsUrl.toString(),
    crumbIssuer: true,
    promisify: true,
  });
  const jobPath = core
    .getInput("job-path", { required: true })
    .replace(/job\//g, "");
  const parameters = JSON.parse(core.getInput("job-params") || "{}");
  const pollInterval = parseInt(core.getInput("poll-interval") || 10) * 1000;
  const timeout = parseInt(core.getInput("timeout") || 180) * 1000;

  const queueId = await jenkinsClient.job.build({ name: jobPath, parameters });
  core.info(`queueId: ${queueId}`);
  const queue = await jenkinsClient.queue.item(queueId);

  const buildId = queue.executable.number;
  core.info(`buildId: ${buildId}`);

  let timedOut = false;
  const timeoutId = setTimeout(() => (timedOut = true), timeout);

  try {
    while (true) {
      const build = await jenkinsClient.build.get(jobPath, buildId);
      if (build.building === false) {
        core.info(build.result);
        core.info(build.url);
        core.setOutput("job_status", build.result);
        core.setOutput("build_url", build.url);
        if (build.result !== "SUCCESS") {
          throw new Error("Build did not succeed");
        }
        break;
      }
      if (timedOut) {
        throw new Error("Timed out");
      } else {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
})().catch((error) => core.setFailed(error.message));
