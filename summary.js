const core = require("@actions/core");
const { SUMMARY_ENV_VAR } = require("@actions/core/lib/summary");

const icons = {
  passed: ":white_check_mark:",
  failed: ":red_circle:",
};

async function addSummary({ cli, filter, includeSummary }) {
  if (!includeSummary || !(SUMMARY_ENV_VAR in process.env)) {
    return;
  }

  const headers = [
    { data: "Title", header: true },
    { data: "Status", header: true },
  ];

  const recordings = cli.listAllRecordings({ all: true, filter });

  const hasTestMetadata = recordings.some((r) => r.metadata.test);
  if (hasTestMetadata) {
    headers.splice(1, 0, { data: "Test Result", header: true });
  }

  const recordingRows = recordings.map((r) => {
    const title =
      r.status === "uploaded"
        ? `<a href="https://app.replay.io/recording/${r.id}" target="_blank">${r.metadata.title}</a>`
        : r.metadata.title;
    const status = r.status;

    if (hasTestMetadata) {
      const result = r.metadata.test?.result;
      const resultCounts = r.metadata.test?.resultCounts;

      if (resultCounts && resultCounts.passed > 0 && resultCounts.failed > 0) {
        return [
          title,
          `${resultCounts.passed} ${icons.passed} / ${resultCounts.failed} ${icons.failed} / `,
          status,
        ];
      }

      return [title, icons[result] || "", status];
    }

    return [title, status];
  });

  await core.summary
    .addHeading("Replay Uploads", 2)
    .addTable([headers, ...recordingRows])
    .write();
}

module.exports = addSummary;
