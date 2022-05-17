process.env = {
  ...process.env,
  GITHUB_ACTION_PATH: ".",
  GITHUB_REF: "abc123",
  GITHUB_SHA: "abc123",
  GITHUB_REF_NAME: "ryanjduffy-patch-1",
  GITHUB_REPOSITORY: "replayio/action-upload",
};

const github = {
  event: {
    commits: [{ message: "My Commit" }],
    issue: {
      number: "1234",
      title: "okay",
    },
  },
};

const inputs = {
  apiKey: process.env.RECORD_REPLAY_API_KEY,
  public: false,
  filter: null,
};
const cliPath = "/node_modules/@replayio/replay";
const cli = require(process.env.GITHUB_ACTION_PATH + cliPath);
const { source } = require(process.env.GITHUB_ACTION_PATH + cliPath + "/metadata");
const upload = require(process.env.GITHUB_ACTION_PATH + "/dist/upload.js");
const metadata = process.env.GITHUB_SHA && source.init({
  branch: process.env.GITHUB_REF_NAME,
  commit: {
    id: process.env.GITHUB_SHA,
    title: github.event.commits[0].message,
  },
  merge: github.event.issue.number && {
    id: github.event.issue.number,
    title: github.event.issue.title,
  },
  provider: "github",
  repository: process.env.GITHUB_REPOSITORY,
});
upload({
  cli,
  apiKey: inputs.apiKey,
  public: inputs.public,
  filter: inputs.filter,
  metadata,
})
  .then(console.log)
  .catch(console.error);
