// source.js
var fs = require("fs");
function buildSourceMetadata(source, eventPath) {
  if (fs.existsSync(eventPath)) {
    try {
      const event = JSON.parse(fs.readFileSync(eventPath));
      let metadata;
      if (event.pull_request) {
        const { pull_request: { head, number, title }, repository: { full_name } } = event;
        metadata = {
          branch: head.ref,
          provider: "github",
          repository: full_name,
          commit: {
            id: head.sha
          },
          merge: {
            id: String(number),
            title
          }
        };
      }
      if (metadata) {
        return source.init(metadata);
      }
    } catch (e) {
      console.error("Failed to generate source control metadata");
      console.error(e);
    }
  }
}
module.exports = buildSourceMetadata;
