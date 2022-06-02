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
      repository: { full_name }
    } = event;
    const sha = context.sha;
    const metadata = {
      branch: context.ref.replace(/^refs\/heads\//, ""),
      provider: "github",
      repository: full_name,
      trigger: {
        user: context.actor,
        name: context.eventName,
        workflow: context.workflow
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
