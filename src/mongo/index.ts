import dotenv from "dotenv";
dotenv.config();
import mongoose, { connect, Types, PipelineStage } from "mongoose";

import User from "./user";
import { Bet, UserBet } from "./bet";
import * as Errors from "../error";

if (!process.env.MONGO_URL) throw new Error("No mongo url");
connect(process.env.MONGO_URL);

interface BetBase {
  money: number;
  userId: string;
}

interface BooleanBet extends BetBase {
  prediction: boolean;
}
interface TextBet extends BetBase {
  predictionText: string;
}

interface CreateBet extends TextBet, BooleanBet {
  channelId: string;
  description: string;
}

export async function createBet({
  channelId,
  description,
  money,
  userId,
  ...predictionBoolOrText
}: CreateBet): Promise<string> {
  try {
    const bet = await new Bet({
      channelId,
      description,
      bets: [
        new UserBet({
          userId,
          money,
          ...predictionBoolOrText,
        }),
      ],
    }).save();
    return String(bet._id);
  } catch {
    throw new Errors.CreateError("bet");
  }
}

interface JoinBet extends TextBet, BooleanBet {
  betId: string;
}
export async function updateBet({
  betId,
  money,
  userId,
  predictionText,
  prediction,
}: JoinBet): Promise<string> {
  const bet = await Bet.findById(betId);
  if (!bet) {
    throw new Errors.NotFoundError("bet");
  }
  const userBet = bet.bets.id(betId);
  if (userBet) {
    userBet.money = money;
    userBet.prediction = prediction;
    userBet.predictionText = predictionText;
  } else {
    bet.bets.push({
      userId,
      money,
      prediction,
      predictionText,
    });
  }
  try {
    await bet.save();
    return bet.id;
  } catch (e) {
    throw new Errors.UpdateError(String(e));
  }
}
