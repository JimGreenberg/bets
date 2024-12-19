import { App, Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Bet, UserBet } from "../types";
import * as DB from "../mongo";
import * as S from "../view/slack";
import { SlackService } from "../slackService";

export const LIST_BETS_PATTERN = /^list$/;

export const listBets: (app: App) => Middleware<SlackCommandMiddlewareArgs> =
  (app: App) =>
  async ({ command, body: { text, user_name }, respond, say }) => {
    const channelId = command.channel_id;
    const _bets = await DB.MongoBet.find({
      channelId,
      "userBets.fulfilled": { $exists: false },
    });
    if (!_bets.length) {
      return await respond({
        response_type: "ephemeral",
        text: "No outstanding bets to show",
        replace_original: false,
      });
    }
    const bets: Bet[] = _bets.map((b) =>
      b.toObject({ flattenObjectIds: true })
    );
    const slackService = new SlackService(app);
    const users = await slackService.getUsers(channelId);
    await say({
      blocks: bets
        .map(({ userBets, description, code, money }) => [
          S.Section(
            S.PlainText(description),
            userBets.length
              ? {
                  accessory: S.Button({
                    text: "Resolve",
                    value: code,
                    action_id: "resolve-bet",
                  }),
                }
              : {}
          ),
          S.Context(
            S.Markdown(
              `Wager: $${money} | Join Code: ${code} | Bettors: ${
                userBets.length ? "" : "None"
              }`
            ),
            ...(userBets.map(({ slackUserId }) => {
              const slackUser = users.find(({ id }) => id === slackUserId);
              return S.Image({
                image_url: slackUser?.image || "",
                alt_text: slackUser?.name || "",
              });
            }) as [ReturnType<typeof S.Image>])
          ),
          S.Divider(),
        ])
        .flat(),
      text: "list of bets",
    });
  };
