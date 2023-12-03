import './i18n'

// Connect to Discord
import { Client, IntentsBitField, WebhookClient, AuditLogEvent, Interaction, Guild, GuildAuditLogsEntry } from 'discord.js'

import logger from './logger'
import setGameCommand from './commands/set-game'
import { generateInvite } from './utils/misc'
import { onCountUpButtonClick } from './interactions/countUpButton'
import { explainGame } from './interactions/explanationButton'


const webhookClient = process.env.LOGS_WEBHOOK ? new WebhookClient({ url: process.env.LOGS_WEBHOOK }) : null

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds
  ]
})

// client
//   .on('error', console.log)
//   .on('debug', console.log)
//   .on('warn', console.log)

client.on('guildCreate', async (guild: Guild) => {
  const logs = await guild.fetchAuditLogs().catch(() => null)
  const inviter = logs?.entries
    .find((l: GuildAuditLogsEntry) => l.action === AuditLogEvent.BotAdd &&
      l.targetId === client.user?.id)?.executor

  void webhookClient?.send({
    content: `Joined guild:
\`\`\`
name: ${guild.name} (${guild.id})
inviter: ${inviter != null ? ` invited by ${inviter.tag} (${inviter.id})` : ' (unknown inviter)'}
member count: ${guild.memberCount}
\`\`\``
  })
})

client.on('guildDelete', async guild => {
  void webhookClient?.send({
    content: `Left guild ${guild.name} (${guild.id})`
  })
})

client.on('ready', async () => {
  logger.info(`Logged in as ${client.user?.tag ?? 'unknown'}`)
  console.log(`Logged in as ${client.user?.tag ?? 'unknown'}`)

  void webhookClient?.send({
    content: `Logged in as ${client.user?.tag ?? 'unknown'}`
  })

  await client.guilds.fetch()

  console.log('Bot is ready!')
  console.log(generateInvite(client))

  client.application?.commands.set([
    setGameCommand.command
  ])

})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.guild || !interaction.member) {
    return
  }

  const isChatInputCommand = interaction.isChatInputCommand();
  const isButton = interaction.isButton();

  if (isChatInputCommand) {
    const commandName = interaction.commandName;
    if (commandName === 'set-game') {
      await setGameCommand.run(interaction);
    }
  } else if (isButton) {
    if (interaction.customId.startsWith('count-')) {
      onCountUpButtonClick(interaction);
    } else if (interaction.customId.startsWith('explanation-')) {
      explainGame(interaction);
    }
  }
});

void client.login(process.env.DISCORD_TOKEN)
