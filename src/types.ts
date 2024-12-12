export interface Bet {
  channelId: string;
  description: string;
  code: string;
  money: number;
  userBets: UserBet[];
}

export interface UserBet {
  slackUserId: string;
  prediction: string;
  fulfilled?: boolean | null;
}

export interface User {
  slackUserId: string;
  money: number;
}
