import { MongoBet } from "./schemas/bet";
import { MongoUser } from "./schemas/user";
import * as Errors from "../error";

export async function payOutBet(betId: string) {
  const bet = await MongoBet.findById(betId);
  if (!bet) {
    throw new Errors.NotFoundError("bet");
  }
  if (bet.paidOut) {
    throw new Errors.IllegalTransactionError("bet already paid out");
  }
  if (bet.userBets.some(({ fulfilled }) => typeof fulfilled === "undefined")) {
    throw new Errors.IllegalTransactionError("bet has unfulfilled userBets");
  }
  const pot = bet.money * bet.userBets.length;
  const winners = bet.userBets.filter(({ fulfilled }) => fulfilled);
  const payout = pot / winners.length;
  await MongoUser.updateMany(
    {
      channelId: bet.channelId,
      slackUserId: { $in: winners.map(({ slackUserId }) => slackUserId) },
    },
    {
      $inc: { money: payout },
    }
  );
  bet.paidOut = true;
  await bet.save();
  return {
    winnersSlackUserIds: winners.map(({ slackUserId }) => slackUserId),
    payout,
  };
}
