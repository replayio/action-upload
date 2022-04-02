const cli = require("@replayio/replay");
const axios = require("axios");
const jsonata = require("jsonata");

async function upload(cli, jsonata, filter) {
  const allRecordings = cli.listAllRecordings();

  let recordings = allRecordings;
  if (filter) {
    const exp = jsonata(`$filter($, ${filter})`);
    recordings = exp.evaluate(allRecordings) || [];
  }

  console.log(
    "Processing",
    recordings.length,
    "of",
    allRecordings.length,
    "total recordings"
  );

  let failed = [];
  let success = [];
  for await (let r of recordings) {
    try {
      success.push(await cli.uploadRecording(r.id, { verbose: true }));
    } catch (e) {
      failed.push(e);
    }
  }

  failed.forEach((reason) => {
    console.error("Failed to upload replay:", reason);
  });

  return success;
}

async function makeReplaysPublic(axios, apiKey, recordings) {
  const results = await Promise.allSettled(
    recordings.map((r) => {
      const variables = {
        recordingId: r.recordingId,
        isPrivate: false,
      };

      return axios({
        url: "https://api.replay.io/v1/graphql",
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        data: {
          query: `
            mutation MakeReplayPublic($recordingId: ID!, $isPrivate: Boolean!) {
              updateRecordingPrivacy(input: { id: $recordingId, private: $isPrivate }) {
                success
              }
            }
          `,
          variables,
        },
      }).catch(e => {
        if (e.response) {
          console.log("Parameters");
          console.log(JSON.stringify(variables, undefined, 2))
          console.log("Response");
          console.log(JSON.stringify(e.response.data, undefined, 2));
        }

        throw e.message;
      });
    })
  );

  results.forEach((r) => {
    if (r.status === "rejected") {
      console.error("Failed to mark replay public", r.reason);
    }
  });

  return results.filter(r => r.status === "fulfilled");
}

async function uploadRecordings({ apiKey, filter, public = false }) {
  try {
    const recordingIds = await upload(cli, jsonata, filter);
    const uploaded = cli.listAllRecordings().filter(u => recordingIds.includes(u.recordingId));

    console.log("Uploaded", recordingIds.length, "replays");

    if (public && recordingIds.length > 0) {
      const updated = await makeReplaysPublic(axios, apiKey, uploaded);
      console.log("Marked", updated.length, "replays public");
    }

    return uploaded;
  } catch (e) {
    console.error("Failed to upload recordings");
    console.error(e);

    return [];
  }
}

module.exports = uploadRecordings;
