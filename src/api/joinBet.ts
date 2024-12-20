import { App, Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Bet } from "../types";
import * as S from "../view/slack";
import * as DB from "../mongo";
import * as Errors from "../error";

export const JOIN_BET_PATTERN = /^([a-zA-Z]{4})\s(.*)$/;
interface Payload {
  code: string;
  prediction: string;
}
function parseText(text: string): Payload {
  const result = JOIN_BET_PATTERN.exec(text);
  const code = result?.[1];
  const prediction = result?.[2];
  if (code && prediction) {
    return {
      code: code.toUpperCase(),
      prediction,
    };
  }
  throw new Errors.UnparseableError(text);
}

export const joinBet: (app: App) => Middleware<SlackCommandMiddlewareArgs> =
  (app: App) =>
  async ({ command, body: { text }, respond, say }) => {
    const channelId = command.channel_id;
    const slackUserId = command.user_id;
    const { code, prediction } = parseText(text);
    const bet = await DB.MongoBet.findOne({ code, channelId });
    const user = await DB.MongoUser.findOneAndUpdate(
      { slackUserId, channelId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (!bet || !user) {
      console.log(bet);
      console.log(user);
      return await respond({
        response_type: "ephemeral",
        text: "Error joining bet :dingus:",
        replace_original: false,
      });
    }

    if (bet.money > user.money) {
      return await say({
        text: `<@${slackUserId}> tried to join a bet but didn't have enough money :dingus:`,
      });
    }

    user.money -= bet.money;
    await user.save();
    await DB.updateBet({
      code,
      slackUserId,
      prediction,
    });

    await say({
      text: `<@${slackUserId}> bets ${prediction}`,
    });
  };
