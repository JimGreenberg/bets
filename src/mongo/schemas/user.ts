import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  slackUserId: { type: String, required: true },
  channelId: { type: String, required: true },
  money: { type: Number, required: true },
});
UserSchema.index({ slackUserId: 1, channelId: 1 }, { unique: true });
const USER_MODEL_NAME = "user";
export const MongoUser = model(USER_MODEL_NAME, UserSchema);
