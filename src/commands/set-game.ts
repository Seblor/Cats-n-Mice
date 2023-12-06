import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, Colors, EmbedBuilder, GuildTextBasedChannel, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";
import { addedLanguages } from "../../@types/i18next";
import { generateCustomId } from "../utils/data";
import { generateExplanationButton, generateInviteServerButton } from "../utils/buttonsGenerator";
import { logo } from "../utils/misc";

const setGameCommand = {
  command: new SlashCommandBuilder()
    .setName('set-game')
    .setDescription(i18next.t('commands.set-game.description', { lng: 'en' }))
    .setDescriptionLocalizations({
      "en-GB": i18next.t('commands.set-game.description', { lng: 'en' }),
      "en-US": i18next.t('commands.set-game.description', { lng: 'en' }),
      fr: i18next.t('commands.set-game.description', { lng: 'fr' })
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addChannelOption(option => option
      .setName(i18next.t('commands.set-game.options.channel.name', { lng: 'en' }))
      .setNameLocalizations({
        "en-GB": i18next.t('commands.set-game.options.channel.name', { lng: 'en' }),
        "en-US": i18next.t('commands.set-game.options.channel.name', { lng: 'en' }),
        fr: i18next.t('commands.set-game.options.channel.name', { lng: 'fr' })
      })
      .setDescription(i18next.t('commands.set-game.options.channel.name', { lng: 'en' }))
      .setDescriptionLocalizations({
        "en-GB": i18next.t('commands.set-game.options.channel.description', { lng: 'en' }),
        "en-US": i18next.t('commands.set-game.options.channel.description', { lng: 'en' }),
        fr: i18next.t('commands.set-game.options.channel.description', { lng: 'fr' })
      })
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption(option => option
      .setName(i18next.t('commands.set-game.options.cat-role.name', { lng: 'en' }))
      .setNameLocalizations({
        "en-GB": i18next.t('commands.set-game.options.cat-role.name', { lng: 'en' }),
        "en-US": i18next.t('commands.set-game.options.cat-role.name', { lng: 'en' }),
        fr: i18next.t('commands.set-game.options.cat-role.name', { lng: 'fr' })
      })
      .setDescription(i18next.t('commands.set-game.options.cat-role.name', { lng: 'en' }))
      .setDescriptionLocalizations({
        "en-GB": i18next.t('commands.set-game.options.cat-role.description', { lng: 'en' }),
        "en-US": i18next.t('commands.set-game.options.cat-role.description', { lng: 'en' }),
        fr: i18next.t('commands.set-game.options.cat-role.description', { lng: 'fr' })
      })
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName(i18next.t('commands.set-game.options.language.name', { lng: 'en' }))
      .setNameLocalizations({
        "en-GB": i18next.t('commands.set-game.options.language.name', { lng: 'en' }),
        "en-US": i18next.t('commands.set-game.options.language.name', { lng: 'en' }),
        fr: i18next.t('commands.set-game.options.language.name', { lng: 'fr' })
      })
      .setDescription(i18next.t('commands.set-game.options.language.name', { lng: 'en' }))
      .setDescriptionLocalizations({
        "en-GB": i18next.t('commands.set-game.options.language.description', { lng: 'en' }),
        "en-US": i18next.t('commands.set-game.options.language.description', { lng: 'en' }),
        fr: i18next.t('commands.set-game.options.language.description', { lng: 'fr' })
      })
      .setRequired(true)
      .addChoices(
        {
          name: 'English',
          value: 'en',
        },
        {
          name: 'Français',
          value: 'fr'
        }
      )
    ),
  run: async (inter: ChatInputCommandInteraction) => {
    if (inter.guildId == null || inter.channelId == null) return;

    const channel = inter.options.getChannel(i18next.t('commands.set-game.options.channel.name', { lng: 'en' })) as GuildTextBasedChannel;
    const catRole = inter.options.getRole(i18next.t('commands.set-game.options.cat-role.name', { lng: 'en' }));
    const language = inter.options.getString(i18next.t('commands.set-game.options.language.name', { lng: 'en' })) as addedLanguages;

    const supportedLanguages = Object.keys(i18next.services.resourceStore.data);

    if (channel == null || catRole == null || language == null || !channel.isTextBased() || supportedLanguages.includes(language) === false) {
      await inter.reply({
        content: "The arguments specified are invalid",
        ephemeral: true
      });
      return;
    }

    const permsInChannel = (inter.channel as GuildTextBasedChannel).permissionsFor(await inter.guild!.members.fetchMe())

    const missingPerms = {
      "View channel": !permsInChannel.has(PermissionsBitField.Flags.ViewChannel),
      "Send messages": !permsInChannel.has(PermissionsBitField.Flags.SendMessages),
      "Embed links": !permsInChannel.has(PermissionsBitField.Flags.EmbedLinks),
      "Attach files": !permsInChannel.has(PermissionsBitField.Flags.AttachFiles),
      "Manage roles": !permsInChannel.has(PermissionsBitField.Flags.ManageRoles),
    }
    if (Object.values(missingPerms).some(v => v)) {
      await inter.reply({
        content: `${Object.values(missingPerms).filter(v => v).length > 1 ? 'Some permissions are' : 'A permission is'} missing in <#${inter.channelId}> :
          ${Object.entries(missingPerms).map(([key, value]) => {
          return `- ${value ? '❌' : '✅'} ${key}`
        }).join('\n')}`,
        ephemeral: true
      })

      return this
    }

    await inter.reply({
      content: `The game has been set up in <#${inter.channelId}>.`,
      ephemeral: true
    });


    channel.send({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setTitle(i18next.t('embed.new-game', { lng: language }))
          .setThumbnail('attachment://logo.webp')
          .setDescription(i18next.t('embed.description', { lng: language }))
          .setColor(Colors.Green)
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(generateCustomId({
                currentScore: 0,
                language,
                memberId: '',
                maxScore: 0,
                recordHolderId: '',
                catRoleId: catRole.id
              }))
              .setLabel('+1')
              .setStyle(ButtonStyle.Primary),
              generateExplanationButton(catRole.id, language),
              generateInviteServerButton(inter.client, language)
          )
      ],
      files: [
        logo
      ]
    });
  }
}

export default setGameCommand
