import { App, Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Bet } from "../types";
import * as DB from "../mongo";
import * as Errors from "../error";

// const result = /^(.+)\s(\d+)\s?(.*)?$/.exec(text); // old regex for (description) (money) (prediction)
export const START_BET_PATTERN = /^(.*?)\s(\d+)$/;
interface Payload {
  description: string;
  money: number;
}
function parseText(text: string): Payload {
  const result = START_BET_PATTERN.exec(text);
  const description = result?.[1];
  const money = result?.[2];
  if (description && money) {
    return {
      description,
      money: parseInt(money),
    };
  }
  throw new Errors.UnparseableError(text);
}

export const startBet: (app: App) => Middleware<SlackCommandMiddlewareArgs> =
  (app: App) =>
  async ({ command, body: { text, user_name }, respond, say }) => {
    const userId = command.user_id;
    let bet: Bet;
    const parsed = parseText(text);
    try {
      bet = await DB.createBet({
        channelId: command.channel_id,
        initiator: userId,
        ...parsed,
      });
    } catch (e) {
      console.error(e);
      return await respond({
        response_type: "ephemeral",
        text: "Error creating bet :dingus:",
        replace_original: false,
      });
    }
    await say({
      text: `<!channel> <@${userId}> started a new bet for $${bet.money}: ${bet.description}. To join: \`/bet ${bet.code} <your prediction>\``,
    });
  };
