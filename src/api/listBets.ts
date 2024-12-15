import { App, Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Bet } from "../types";
import * as DB from "../mongo";
import * as S from "../view/slack";

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
    await say({
      blocks: bets.map(({ description, code }) =>
        S.Section(S.PlainText(description), {
          accessory: S.Button({
            text: "Resolve",
            value: code,
            action_id: "resolve-bet",
          }),
        })
      ),
      text: "list of bets",
    });
  };
