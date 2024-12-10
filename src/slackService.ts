import { App, RespondFn } from "@slack/bolt";
import * as DB from "./mongo";

interface User {
  id: string;
  name: string;
  image: string;
}

export class SlackService {
  private users: User[];

  constructor(private app: App) {}

  async getUsers(channelId: string) {
    if (this.users) return this.users;
    const { members } = await this.app.client.conversations.members({
      channel: channelId,
    });
    if (!members?.length) throw new Error();

    const { members: users } = await this.app.client.users.list();
    if (!users?.length) throw new Error();

    this.users = users
      .filter(({ is_bot }) => !is_bot)
      .filter(({ id }) => members.includes(id as string))
      .map((user) => ({
        id: user.id!,
        name: user.profile?.display_name!,
        image: user.profile?.image_24!,
      }));

    return this.users;
  }
}
