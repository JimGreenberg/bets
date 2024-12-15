import { Bet } from "../types";
import * as S from "../view/slack";

export function _userBets(
  bet: Bet,
  users: { id: string; name: string; image: string }[]
) {
  return bet.userBets
    .map(({ _id, prediction, fulfilled, slackUserId }) => {
      const user = users.find(({ id }) => id === slackUserId);
      if (!user) throw new Error();
      const blocks = [
        S.Context(
          S.Image({
            image_url: user.image,
            alt_text: user.name,
          }),
          S.Markdown(` ${user.name} predicted: _${prediction}_`)
        ),
      ];
      if (typeof fulfilled === "boolean") {
        blocks.push(S.Section(S.PlainText(fulfilled ? "Right" : "Wrong")));
      } else {
        blocks.push(
          S.Actions(
            S.Button({
              text: "Right",
              value: _id,
              style: "primary",
              action_id: `fulfil-userbet-true`,
            }),
            S.Button({
              text: "Wrong",
              value: _id,
              style: "danger",
              action_id: `fulfil-userbet-false`,
            })
          )
        );
      }

      blocks.push(S.Divider());
      return blocks;
    })
    .flat();
}
