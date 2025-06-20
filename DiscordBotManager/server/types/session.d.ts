
import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      discriminator: string;
      avatar: string;
      email: string;
    };
    userGuilds?: Array<{
      id: string;
      name: string;
      icon: string;
      permissions: number;
      owner: boolean;
    }>;
    oauthState?: string;
  }
}
