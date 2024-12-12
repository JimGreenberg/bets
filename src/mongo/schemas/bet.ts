import { model, Schema } from "mongoose";

import { UserBetSchema } from "./userBet";

function generateCode() {
  return new Array(4)
    .fill(null)
    .map(() => String.fromCharCode(65 + Math.floor(26 * Math.random())))
    .join("");
}

const BetSchema = new Schema({
  channelId: { type: String, required: true },
  code: { type: String, required: true, unique: true, default: generateCode },
  date: { type: Date, default: new Date() },
  initiator: String,
  description: { type: String, required: true },
  money: { type: Number, required: true },
  userBets: { type: [UserBetSchema], default: [] },
});

const BET_MODEL_NAME = "bet";
export const MongoBet = model(BET_MODEL_NAME, BetSchema);
