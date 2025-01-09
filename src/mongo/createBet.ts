import { MongoBet, UserBet } from "./schemas/bet";
import { Bet } from "../types";
import * as Errors from "../error";

interface CreateBet {
  channelId: string;
  money: number;
  description: string;
  /** slack user id */
  initiator: string;
}

export async function createBet({
  channelId,
  description,
  initiator,
  money,
}: CreateBet): Promise<Bet> {
  try {
    const bet = await new MongoBet({
      channelId,
      description,
      initiator,
      money,
      userBets: [{ slackUserId: initiator, prediction: description }],
    }).save();
    return bet.toObject({ flattenObjectIds: true });
  } catch {
    throw new Errors.CreateError("bet");
  }
}
