const axios = require("axios");

async function upload(cli, apiKey, filter, metadata) {
  try {
    const allRecordings = cli.listAllRecordings();
    const recordings = cli.listAllRecordings({ filter });

    console.log(
      "Processing",
      recordings.length,
      "of",
      allRecordings.length,
      "total recordings"
    );

    if (metadata) {
      console.log("Adding metadata to", recordings.length, "replays");
      console.log(JSON.stringify(metadata, undefined, 2));
      recordings.forEach((r) => cli.addLocalRecordingMetadata(r.id, metadata));
    }

    return cli.uploadAllRecordings({ filter, apiKey, verbose: true });
  } catch (e) {
    console.error(e);

    return false;
  }
}

async function makeReplaysPublic(apiKey, recordings) {
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
      }).catch((e) => {
        if (e.response) {
          console.log("Parameters");
          console.log(JSON.stringify(variables, undefined, 2));
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

  return results.filter((r) => r.status === "fulfilled");
}

function handleUploadedReplays(cli, filter, existing) {
  const ids = existing.map((r) => r.id);

  const recordings = cli
    .listAllRecordings({
      // all: true to include uploaded and crashUploaded
      all: true,
      filter,
    })
    .filter((r) => ids.includes(r.id));

  const { failed, uploaded, crashed } = recordings.reduce(
    (acc, u) => {
      acc[
        u.status === "uploaded"
          ? "uploaded"
          : u.status === "crashUploaded"
          ? "crashed"
          : "failed"
      ].push(u);
      return acc;
    },
    { crashed: [], uploaded: [], failed: [] }
  );

  console.log("Uploaded", uploaded.length, "replay(s)");

  if (crashed.length) {
    console.log("Uploaded", crashed.length, "crash report(s)");
  }

  if (failed.length) {
    console.log("Failed to upload", failed.length, "replay(s)");
  }

  return uploaded;
}

async function uploadRecordings({
  cli,
  apiKey,
  filter,
  public = false,
  metadata,
}) {
  try {
    const existing = cli.listAllRecordings({ filter });
    return [];
    // await upload(cli, apiKey, filter, metadata);
    // const uploaded = handleUploadedReplays(cli, filter, existing);

    // if (public && uploaded.length > 0) {
    //   const updated = await makeReplaysPublic(apiKey, uploaded);
    //   console.log("Marked", updated.length, "replays public");
    // }

    // return uploaded;
  } catch (e) {
    console.error("Failed to upload recordings");
    console.error(e);

    return [];
  }
}

module.exports = uploadRecordings;
