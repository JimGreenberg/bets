import { MongoBet } from "./schemas/bet";
import { Bet } from "../types";
import * as Errors from "../error";

interface UpdateBet {
  code: string;
  slackUserId: string;
  prediction: string;
}
export async function updateBet({
  code,
  slackUserId,
  prediction,
}: UpdateBet): Promise<Bet> {
  const bet = await MongoBet.findOne({ code });
  if (!bet) {
    throw new Errors.NotFoundError("bet");
  }
  const userBet = bet.userBets.find(
    (userBet) => userBet.slackUserId === slackUserId
  );
  if (userBet) {
    userBet.prediction = prediction;
  } else {
    bet.userBets.push({
      slackUserId,
      prediction,
    });
  }
  try {
    await bet.save();
    return bet.toObject({ flattenObjectIds: true });
  } catch (e) {
    throw new Errors.UpdateError(String(e));
  }
}
