import { model, Schema } from "mongoose";

const UserBetSchema = new Schema({
  date: { type: Date, default: new Date() },
  userId: { type: String, required: true },
  money: { type: Number, required: true },
  // these values are mutually exclusive and should be validated in the application layer
  prediction: Boolean,
  predictionText: String,
});

const BetSchema = new Schema({
  date: { type: Date, default: new Date() },
  description: { type: String, required: true },
  bets: [UserBetSchema],
});

const BET_MODEL_NAME = "bet";
export default model(BET_MODEL_NAME, BetSchema);
