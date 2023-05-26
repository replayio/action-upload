const core = require("@actions/core");
const { SUMMARY_ENV_VAR } = require("@actions/core/lib/summary");

async function addSummary({ cli, filter, includeSummary }) {
  if (!includeSummary || !process.env[SUMMARY_ENV_VAR]) {
    return;
  }

  const headers = [
    { data: "Title", header: true },
    { data: "Link", header: true },
    { data: "ID", header: true },
    { data: "Status", header: true },
  ];

  const recordings = cli.listAllRecordings({ all: true, filter });

  const recordingRows = await Promise.all(
    recordings.map(async (r) => [
      r.metadata.title,
      r.status === "uploaded"
        ? `<a href="https://app.replay.io/recording/${r.id}" target="_blank">View</a>`
        : "",
      r.id,
      r.status,
    ])
  );

  await core.summary
    .addHeading("Replay Uploads", 2)
    .addTable([headers, ...recordingRows])
    .write();
}

module.exports = addSummary;
