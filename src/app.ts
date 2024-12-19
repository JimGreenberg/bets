import dotenv from "dotenv";
dotenv.config();
import { App, BlockAction, ButtonAction } from "@slack/bolt";
import * as API from "./api";
import * as DB from "./mongo";

const BOT_TEST = "C03LZF604RG";

const main = (app: App) => {
  app.command("/bet", async (args) => {
    await args.ack();
    if (API.START_BET_PATTERN.test(args.command.text)) {
      return await API.startBet(app)(args);
    }
    if (API.JOIN_BET_PATTERN.test(args.command.text)) {
      return await API.joinBet(app)(args);
    }
    if (API.LIST_BETS_PATTERN.test(args.command.text)) {
      return await API.listBets(app)(args);
    }
  });

  app.action<BlockAction<ButtonAction>>("resolve-bet", async (args) => {
    await args.ack();
    await API.resolveBet(app)(args);
  });

  app.action<BlockAction<ButtonAction>>("cancel-bet", async (args) => {
    await args.ack();
    await API.canceleBet(app)(args);
  });

  app.action<BlockAction<ButtonAction>>(/fulfil-userbet-/, async (args) => {
    await args.ack();
    await API.fulfilUserBet(app)(args);
  });
};

const newApp = () =>
  new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
  });

const runtime = () => {
  const _app = newApp();
  _app.start();
  main(_app);
  // @ts-ignore
  _app.error((...args) => {
    console.error(args);
    runtime();
  });
};

runtime();
