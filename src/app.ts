import dotenv from "dotenv";
dotenv.config();
import { App } from "@slack/bolt";
import * as API from "./api";

const BOT_TEST = "C03LZF604RG";

const main = (app: App) => {
  app.command("/bet", async (args) => {
    await args.ack();
    switch (args.command.text) {
      default:
        return "";
    }
  });

  // app.action("join", async (args) => {
  //   await args.ack();
  //   await API.joinGame(app)(args);
  // });
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