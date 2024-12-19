import dotenv from "dotenv";
dotenv.config();
import mongoose, { connect } from "mongoose";

if (!process.env.MONGO_URL) throw new Error("No mongo url");
connect(process.env.MONGO_URL);

import { MongoBet, MongoUserBet, MongoUser } from "./schemas";

MongoBet.syncIndexes();
MongoUserBet.syncIndexes();
MongoUser.syncIndexes();

export { MongoBet, MongoUserBet, MongoUser };
export { createBet } from "./createBet";
export { updateBet } from "./deleteBet";
export { payOutBet } from "./payOutBet";
