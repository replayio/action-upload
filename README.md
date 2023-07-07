# `replayio/action-upload`

Upload recordings to [Replay](https://replay.io)

**Use with [`@replayio/cypress`](https://github.com/replayio/replay-cli/tree/main/packages/cypress) or [`@replayio/playwright`](https://github.com/replayio/replay-cli/tree/main/packages/playwright) to record and upload replays of failed tests.** Read more in the [Replay documentation here](https://docs.replay.io/docs/recording-tests-9f771761436440e6b672701e6107d2b1#2f17815187014b5b931eebf84141b1b7).

## Usage

1. Log into [app.replay.io](https://app.replay.io)
2. Create a [Team API key](https://docs.replay.io/docs/setting-up-a-team-f5bd9ee853814d6f84e23fb535066199#4913df9eb7384a94a23ccbf335189370) (Personal API keys can be used, but have a limit of 10 recordings)
3. Store the API key as a [GitHub Repository Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) named `RECORD_REPLAY_API_KEY`
4. Add the configuration below to your existing workflow

```yaml
- uses: replayio/action-upload@v0.5.1
  with:
    api-key: ${{ secrets.RECORD_REPLAY_API_KEY }}
```

If no filter is passed, all replays, passed and failing, will be uploaded. To upload only failed tests, use the following example:

```yaml
- uses: replayio/action-upload@v0.5.1
  with:
    api-key: ${{ secrets.RECORD_REPLAY_API_KEY }}
    filter: ${{ 'function($v) { $v.metadata.test.result = "failed" }' }}
```

## Arguments

| Required           | Name                | Description                                                                                                                                           | Default |
| ------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| :white_check_mark: | `api-key`           | The Replay API Key used to upload recordings                                                                                                          |
| &nbsp;             | `filter`            | A [JSONata](https://jsonata.org/) function to pass to `[$filter](https://docs.jsonata.org/higher-order-functions#filter)` to select replays to upload |
| &nbsp;             | `public`            | When true, make replays public on upload                                                                                                              | `false` |
| &nbsp;             | `include-summaries` | When true, a table of uploaded replays is added to the GitHub workflow summary page                                                                   | `true`  |

## Returns

| Name         | Description                        |
| ------------ | ---------------------------------- |
| `recordings` | An array of recording IDs uploaded |
