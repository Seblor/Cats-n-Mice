import { AttachmentBuilder, Client, OAuth2Scopes } from "discord.js";

export const logo = new AttachmentBuilder('./assets/logo.webp').setName('logo.webp')

export function isProduction(): boolean {
  return process.env.NODE_ENV?.startsWith('prod') ?? false;
}

export function generateInvite(client: Client): string {
  return client.generateInvite({
    scopes: [
      OAuth2Scopes.Bot
    ],
    permissions: [
      'SendMessages',
      'ViewAuditLog',
      "ManageRoles",
      'ViewChannel',
      'UseApplicationCommands',
      'EmbedLinks',
      'AttachFiles',
      'ReadMessageHistory'
    ]
  })
}

type DiscordLookupUser = {
  id: string;
  created_at: string;
  tag: string;
  global_name: string;
  badges: string[];
  avatar: {
      id: string | null;
      link: string | null;
      is_animated: boolean;
  };
  banner: {
      id: string | null;
      link: string | null;
      is_animated: boolean;
      color: string | null;
  };
};

/**
 * query a Discord user using `https://discordlookup.mesavirep.xyz/v1/user/[userID]`
 */
export async function getUserDataWithAPI(userId: string): Promise<DiscordLookupUser | null> {
  const res = await fetch(`https://discordlookup.mesavirep.xyz/v1/user/${userId}`).catch(() => null);
  const data = (await res?.json() ?? null) as DiscordLookupUser | null;
  if (data && typeof data.id !== 'string') return null;
  return data as DiscordLookupUser;
}

/**
 * query a Discord user the bot's API
 */
export async function getUserDataWithDiscord(userId: string, client: Client): Promise<DiscordLookupUser | null> {
  const user = await client.users.fetch(userId).catch(() => null);
  if (user == null) return null;

  const data = {
    id: user.id,
    created_at: user.createdAt.toISOString(),
    tag: user.tag,
    global_name: user.username,
    badges: [],
    avatar: {
      id: user.avatar,
      link: user.displayAvatarURL(),
      is_animated: user.avatar?.startsWith('a_') ?? false,
    },
    banner: {
      id: null,
      link: null,
      is_animated: false,
      color: null,
    },
  };

  return data;
}

export async function getUserData(userId: string, client: Client): Promise<DiscordLookupUser | null> {
  return await getUserDataWithAPI(userId) ?? await getUserDataWithDiscord(userId, client);
}