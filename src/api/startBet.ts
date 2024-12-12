import { App, Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import * as DB from "../mongo";
import * as Errors from "../error";

// const result = /^(.+)\s(\d+)\s?(.*)?$/.exec(text); // old regex for (description) (money) (prediction)
interface Payload {
  description: string;
  money: number;
}
function parseText(text: string): Payload {
  const result = /^(.*?)\s(\d+)$/;
  const description = result?.[1];
  const money = result?.[2];
  if (description && money) {
    return {
      description,
      money: parseInt(money),
    };
  }
  throw new Errors.UnparseableError();
}

export const startBet: (app: App) => Middleware<SlackCommandMiddlewareArgs> =
  (app: App) =>
  async ({ command, body: { text }, respond, say }) => {
    const userId = command.user_id;
    let betId: string;
    const parsed = parseText(text);
    try {
      betId = await DB.createBet({
        channelId: command.channel_id,
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
    const slackUser = await app.client.users.profile.get({ user: userId });
    const user = {
      id: userId,
      name: slackUser.profile?.display_name!,
      image: slackUser.profile?.image_24!,
    };
    if (!betId || !user.name || !user.image) {
      return await respond({
        response_type: "ephemeral",
        text: "Error creating game :dingus:",
        replace_original: false,
      });
    }
    await say({
      // blocks: startView(),
      text: `<!channel> <${user.id}> bet $${parsed.money} that ${parsed.description}`,
    });
  };
