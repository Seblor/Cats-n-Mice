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
  // const res = await fetch(`https://discordlookup.mesavirep.xyz/v1/user/${userId}`).catch(() => null);
  // const data = (await res?.json() ?? null) as DiscordLookupUser | null;
  const data = await queryUserData(userId).catch(() => null);
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

const userDataCache: Record<string, { data: DiscordLookupUser, fetchedAt: Date }> = {};
const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;

function queryUserData(id: string, maxCacheTime = THREE_HOURS_IN_MS): Promise<DiscordLookupUser | null> {
  if (userDataCache[id] && userDataCache[id].fetchedAt.getTime() + maxCacheTime > Date.now()) {
    return Promise.resolve(userDataCache[id].data);
  }
  try {
    fetch(`https://canary.discord.com/api/v10/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      },
    })
      .then((res) => res.json())
      .then((json: any) => {
        if (json.message) return null; // If error is fetched from API, return null

        let publicFlags: string[] = [];

        let premiumTypes = {
          0: "None",
          1: "Nitro Classic",
          2: "Nitro",
          3: "Nitro Basic"
        }

        USER_FLAGS.forEach((flag) => {
          if (json.public_flags & flag.bitwise) publicFlags.push(flag.flag);
        });

        let avatarLink = null;
        if (json.avatar)
          avatarLink = `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}`;

        let bannerLink = null;
        if (json.banner)
          bannerLink = `https://cdn.discordapp.com/banners/${json.id}/${json.banner}?size=480`;

        let output = {
          id: json.id,
          created_at: snowflakeToDate(json.id).toISOString(),
          username: json.username,
          tag: json.global_name,
          avatar: {
            id: json.avatar,
            link: avatarLink,
            is_animated: json.avatar != null && json.avatar.startsWith("a_") ? true : false,
          },
          avatar_decoration: json.avatar_decoration_data,
          badges: publicFlags,
          premium_type: premiumTypes[json.premium_type as 0 | 1 | 2 | 3],
          accent_color: json.accent_color,
          global_name: json.global_name,
          banner: {
            id: json.banner,
            link: bannerLink,
            is_animated: json.banner != null && json.banner.startsWith("a_") ? true : false,
            color: json.banner_color,
          },
          raw: json
        }

        userDataCache[id] = {
          data: output,
          fetchedAt: new Date()
        };

        return output
      });
  } catch (err) {
    console.log(err);
  }
  return Promise.resolve(null)
}

export function snowflakeToDate(id: string) {
  let temp = parseInt(id).toString(2);
  let length = 64 - temp.length;

  if (length > 0)
    for (let i = 0; i < length; i++)
      temp = "0" + temp;

  temp = temp.substring(0, 42)
  const date = new Date(parseInt(temp, 2) + 1420070400000)

  return date;
}

const USER_FLAGS = [
  {
    flag: "DISCORD_EMPLOYEE",
    bitwise: 1 << 0
  },
  {
    flag: "PARTNERED_SERVER_OWNER",
    bitwise: 1 << 1
  },
  {
    flag: "HYPESQUAD_EVENTS",
    bitwise: 1 << 2
  },
  {
    flag: "BUGHUNTER_LEVEL_1",
    bitwise: 1 << 3
  },
  {
    flag: "HOUSE_BRAVERY",
    bitwise: 1 << 6
  },
  {
    flag: "HOUSE_BRILLIANCE",
    bitwise: 1 << 7
  },
  {
    flag: "HOUSE_BALANCE",
    bitwise: 1 << 8
  },
  {
    flag: "EARLY_SUPPORTER",
    bitwise: 1 << 9
  },
  {
    flag: "TEAM_USER",
    bitwise: 1 << 10
  },
  {
    flag: "BUGHUNTER_LEVEL_2",
    bitwise: 1 << 14
  },
  {
    flag: "VERIFIED_BOT",
    bitwise: 1 << 16
  },
  {
    flag: "EARLY_VERIFIED_BOT_DEVELOPER",
    bitwise: 1 << 17
  },
  {
    flag: "DISCORD_CERTIFIED_MODERATOR",
    bitwise: 1 << 18
  },
  {
    flag: "BOT_HTTP_INTERACTIONS",
    bitwise: 1 << 19
  },
  {
    flag: "SPAMMER",
    bitwise: 1 << 20
  },
  {
    flag: "ACTIVE_DEVELOPER",
    bitwise: 1 << 22
  },
  {
    flag: "QUARANTINED",
    bitwise: 17592186044416
  }
];
