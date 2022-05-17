// source.js
var fs = require("fs");
function buildSourceMetadata(source, eventPath) {
  if (fs.existsSync(eventPath)) {
    try {
      const event = JSON.parse(fs.readFileSync(eventPath));
      console.log(event);
      return source.init({
        branch: event.head?.ref,
        commit: {
          id: event.head?.sha,
          title: event.commits?.[0].message
        },
        merge: event.pull_request?.number && {
          id: event.pull_request.number,
          title: event.pull_request.title
        },
        provider: "github",
        repository: event.repo?.full_name
      });
    } catch (e) {
      console.error("Failed to generate source control metadata");
      console.error(e);
    }
  }
}
module.exports = buildSourceMetadata;
