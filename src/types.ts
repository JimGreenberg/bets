export interface Bet {
  channelId: string;
  description: string;
  code: string;
  money: number;
  userBets: UserBet[];
}

export interface UserBet {
  userId: string;
  prediction: string;
  fulfilled?: boolean | null;
}
