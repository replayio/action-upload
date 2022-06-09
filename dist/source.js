// source.js
async function getTitle(github, owner, repo, commit_sha) {
  try {
    if (commit_sha && !/^[a-z0-9]{40}$/i.test(commit_sha)) {
      throw new Error(`Invalid SHA: ${commit_sha}`);
    }
    const commit = await github.rest.git.getCommit({
      owner,
      repo,
      commit_sha
    });
    return commit?.data?.message;
  } catch (e) {
    console.error(e);
  }
}
async function buildSourceMetadata(source, context, github) {
  try {
    const event = context.payload;
    const {
      pull_request: { head, number, title } = {},
      repository: { full_name = process.env.GITHUB_REPOSITORY } = {}
    } = event;
    const sha = head ? head.sha : context.sha;
    const ref = head ? head.ref : context.ref;
    const [owner, repo] = full_name.split("/");
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
        title: await getTitle(github, owner, repo, sha)
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
