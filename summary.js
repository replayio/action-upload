const core = require("@actions/core");
const { SUMMARY_ENV_VAR } = require("@actions/core/lib/summary");

async function addSummary({ cli, filter, includeSummary }) {
  if (!includeSummary || !(SUMMARY_ENV_VAR in process.env)) {
    return;
  }

  const headers = [
    { data: "Title", header: true },
    { data: "Status", header: true },
  ];

  const recordings = cli.listAllRecordings({ all: true, filter });

  const recordingRows = recordings.map((r) => [
    r.status === "uploaded"
      ? `<a href="https://app.replay.io/recording/${r.id}" target="_blank">${r.metadata.title}</a>`
      : r.metadata.title,
    r.status,
  ]);

  await core.summary
    .addHeading("Replay Uploads", 2)
    .addTable([headers, ...recordingRows])
    .write();
}

module.exports = addSummary;
