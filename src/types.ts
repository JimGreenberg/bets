export interface Bet {
  _id: string | any;
  channelId: string;
  description: string;
  code: string;
  money: number;
  userBets: UserBet[];
}

export interface UserBet {
  _id: string | any;
  slackUserId: string;
  prediction: string;
  fulfilled?: boolean | null;
}

export interface User {
  slackUserId: string;
  money: number;
}
