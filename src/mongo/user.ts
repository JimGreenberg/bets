import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  slackUserId: { type: String, required: true },
  money: { type: Number, required: true },
});
const USER_MODEL_NAME = "user";
export default model(USER_MODEL_NAME, UserSchema);
