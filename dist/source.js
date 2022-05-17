// source.js
var fs = require("fs");
function buildSourceMetadata(source, eventPath) {
  if (fs.existsSync(eventPath)) {
    try {
      const event = JSON.parse(fs.readFileSync(eventPath));
      const {
        pull_request: { head, number, title } = {},
        ref,
        repository: { full_name }
      } = event;
      const metadata = {
        branch: head ? head.ref : ref,
        provider: "github",
        repository: full_name,
        commit: {
          id: head ? head.sha : process.env.GITHUB_SHA
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
}
module.exports = buildSourceMetadata;
