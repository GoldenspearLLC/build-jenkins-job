const core = require("@actions/core");
const jenkins = require("jenkins");

const POLL_INTERVAL = 10_000;
const TIMEOUT = 180_000;

(async () => {
  const jenkinsUrl = new URL(core.getInput("jenkins-url"));
  jenkinsUrl.username = core.getInput("user");
  jenkinsUrl.password = core.getInput("jenkins-token");

  const jenkinsClient = jenkins({
    baseUrl: jenkinsUrl.toString(),
    crumbIssuer: true,
    promisify: true,
  });
  const jobPath = core.getInput("job-path").replace(/job\//g, "");
  const parameters = JSON.parse(core.getInput("job-params"));
  const queueId = await jenkinsClient.job.build({ name: jobPath, parameters });
  console.log("queueId", queueId);
  const queue = await jenkinsClient.queue.item(queueId);

  const buildId = queue.executable.number;
  console.log("buildId", buildId);

  for (let i = Math.ceil(TIMEOUT / POLL_INTERVAL); i >= 0; i--) {
    const build = await jenkinsClient.build.get(jobPath, buildId);
    if (build.building === false) {
      console.log(build.result);
      console.log(build.url);
      core.setOutput("job_status", build.result);
      core.setOutput("build_url", build.url);
      if (build.result !== "SUCCESS") {
        throw new Error("Build did not succeed");
      }
      break;
    }
    if (i === 0) {
      throw new Error("Timed out");
    } else {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
  }
})().catch((error) => core.setFailed(error.message));
