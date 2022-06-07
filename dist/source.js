// source.js
var fs = require("fs");
var { execSync } = require("child_process");
function getTitle(sha) {
  try {
    if (sha && !/^[a-z0-9]{40}$/i.test(sha)) {
      throw new Error(`Invalid SHA: ${sha}`);
    }
    return execSync(`git log -1 --pretty=format:"%s" ${sha || ""}`).toString();
  } catch (e) {
    console.error(e);
  }
}
function buildSourceMetadata(source, context) {
  try {
    const event = context.payload;
    const {
      pull_request: { head, number, title } = {},
      repository: { full_name = process.env.GITHUB_REPOSITORY } = {}
    } = event;
    const sha = head ? head.sha : context.sha;
    const ref = head ? head.ref : context.ref;
    const metadata = {
      branch: ref.replace(/^refs\/heads\//, ""),
      provider: "github",
      repository: full_name,
      trigger: {
        user: context.actor,
        name: context.eventName,
        workflow: context.workflow,
        url: `https://github.com/${full_name}/actions/runs/${context.runId}/attempts/${process.env.GITHUB_RUN_ATTEMPT || "1"}`
      },
      commit: {
        id: sha,
        title: getTitle(sha)
      },
      merge: head && {
        id: String(number),
        title
      }
    };
    return source.init(metadata);
  } catch (e) {
    console.error("Failed to generate source control metadata");
    console.error(e);
  }
}
module.exports = buildSourceMetadata;
