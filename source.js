const fs = require("fs");
const { execSync } = require("child_process");

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

function buildSourceMetadata(source, eventPath) {
  if (fs.existsSync(eventPath)) {
    try {
      const event = JSON.parse(fs.readFileSync(eventPath));

      const {
        pull_request: { head, number, title } = {},
        ref,
        repository: { full_name },
      } = event;
      const sha = head ? head.sha : process.env.GITHUB_SHA;

      const metadata = {
        branch: head ? head.ref : ref,
        provider: "github",
        repository: full_name,
        commit: {
          id: sha,
          title: getTitle(sha)
        },
        merge: head && {
          id: String(number),
          title,
        },
      };

      return source.init(metadata);
    } catch (e) {
      console.error("Failed to generate source control metadata");
      console.error(e);
    }
  }
}

module.exports = buildSourceMetadata;
