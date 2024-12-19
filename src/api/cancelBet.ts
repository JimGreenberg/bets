import {
  App,
  Middleware,
  SlackActionMiddlewareArgs,
  BlockAction,
  ButtonAction,
} from "@slack/bolt";
import { Bet, UserBet } from "../types";
import * as DB from "../mongo";
import * as S from "../view/slack";
import { SlackService } from "../slackService";
import { getListBetBlocks } from "./listBets";

export const LIST_BETS_PATTERN = /^list$/;

export const cancelBet: (
  app: App
) => Middleware<SlackActionMiddlewareArgs<BlockAction<ButtonAction>>> =
  (app: App) =>
  async ({ action, body, respond, say }) => {
    const channelId = body?.channel?.id as string;
    const code = action.value;
    await DB.MongoBet.deleteOne({ code, channelId });
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
    await respond({
      replace_original: true,
      blocks: getListBetBlocks(bets, users),
      text: "list of bets",
    });
  };
