import {
  App,
  ButtonAction,
  BlockAction,
  Middleware,
  SlackActionMiddlewareArgs,
  Button,
} from "@slack/bolt";
import { SlackService } from "../slackService";
import { Bet } from "../types";
import * as DB from "../mongo";
import * as S from "../view/slack";
import { _userBets } from "./_userBets";
import * as Errors from "../error";

export const fulfilUserBet: (
  app: App
) => Middleware<SlackActionMiddlewareArgs<BlockAction<ButtonAction>>> =
  (app: App) =>
  async ({ action, body, respond, say }) => {
    const channelId = body?.channel?.id as string;
    const userId = body.user.id;
    const userBetId = action.value;
    const fulfilled = action.action_id.split("fulfil-userbet-")[1] === "true";
    const _bet = await DB.MongoBet.findOne({
      "userBets._id": userBetId,
    });
    const userBet = _bet?.userBets.id(userBetId);
    if (!_bet || !userBet) {
      return await respond({
        response_type: "ephemeral",
        text: "Couldn't find bet",
        replace_original: false,
      });
    }

    userBet.fulfilled = fulfilled;
    await _bet?.save();

    const bet: Bet = _bet.toObject({ flattenObjectIds: true });
    const slackService = new SlackService(app);
    const slackUsers = await slackService.getUsers(channelId);
    if (
      bet.userBets.some(({ fulfilled }) => typeof fulfilled === "undefined")
    ) {
      return await respond({
        replace_original: true,
        blocks: _userBets(bet, slackUsers),
        text: `<@${userId}> fulfilled <@${userBet.slackUserId}>'s bet as ${
          fulfilled ? "right" : "wrong"
        }`,
      });
    } else {
      const { winnersSlackUserIds, payout } = await DB.payOutBet(bet._id);
      const users = await DB.MongoUser.find({ channelId });
      const blocks = [];
      blocks.push(S.Header(S.PlainText(bet.description)));
      bet.userBets.forEach(({ slackUserId, fulfilled }) => {
        const slackUser = slackUsers.find(({ id }) => id === slackUserId);
        if (!slackUser) throw new Errors.NotFoundError("slack user");
        const user = users.find((user) => slackUserId === user.slackUserId);
        if (!user) throw new Errors.NotFoundError("user");
        blocks.push(
          S.Context(
            S.Image({
              image_url: slackUser.image,
              alt_text: slackUser.name,
            }),
            S.Markdown(
              ` ${slackUser.name} ($${user.money}) ${
                fulfilled ? "won" : "lost"
              } *$${fulfilled ? payout : bet.money}* for predicting: _${
                userBet.prediction
              }_`
            )
          )
        );
      });
      return await respond({
        replace_original: true,
        blocks,
        text: `The results of ${bet.description} are in!`,
      });
    }
  };
