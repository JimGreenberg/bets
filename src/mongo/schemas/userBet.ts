import { model, Schema } from "mongoose";

export const UserBetSchema = new Schema({
  date: { type: Date, default: new Date() },
  slackUserId: { type: String, required: true },
  prediction: { type: String, required: true },
  fulfilled: Boolean,
});

const USER_BET_MODEL_NAME = "user_bet";
export const MongoUserBet = model(USER_BET_MODEL_NAME, UserBetSchema);
