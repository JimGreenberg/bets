import {
  App,
  BlockAction,
  ButtonAction,
  Middleware,
  SlackActionMiddlewareArgs,
} from "@slack/bolt";
import { SlackService } from "../slackService";
import { Bet } from "../types";
import * as DB from "../mongo";
import * as S from "../view/slack";
import { _userBets } from "./_userBets";

export const resolveBet: (
  app: App
) => Middleware<SlackActionMiddlewareArgs<BlockAction<ButtonAction>>> =
  (app: App) =>
  async ({ action, body, respond, say }) => {
    const userId = body.user.id;
    const channelId = body?.channel?.id as string;
    const code = action.value;
    const _bet = await DB.MongoBet.findOne({
      channelId,
      code,
    });
    if (!_bet) {
      return await respond({
        response_type: "ephemeral",
        text: "Couldn't find bet",
        replace_original: false,
      });
    }
    const bet: Bet = _bet.toObject({ flattenObjectIds: true });
    const service = new SlackService(app);
    const users = await service.getUsers(channelId);
    const blocks = _userBets(bet, users);
    return await say?.({
      blocks,
      text: `<@${userId}> is resolving ${bet.description}`,
    });
  };
