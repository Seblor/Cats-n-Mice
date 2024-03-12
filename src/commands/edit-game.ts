import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";
import { addedLanguages } from "../../@types/i18next";
import { generateCustomId, parseCustomId } from "../utils/data";
import { generateCountUpButton, generateExplanationButton, generateInviteServerButton } from "../utils/buttonsGenerator";
import { logo } from "../utils/misc";
import { generateEmbed } from "../interactions/countUpButton";

const editGameCommand = {
  command: new SlashCommandBuilder()
    .setName('edit-game')
    .setDescription(i18next.t('commands.edit-game.description', { lng: 'en' }))
    .setDescriptionLocalizations({
      "en-GB": i18next.t('commands.edit-game.description', { lng: 'en' }),
      "en-US": i18next.t('commands.edit-game.description', { lng: 'en' }),
      fr: i18next.t('commands.edit-game.description', { lng: 'fr' })
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addIntegerOption(option => option
      .setName(i18next.t('commands.edit-game.options.highscore.name', { lng: 'en' }))
      .setNameLocalizations({
        "en-GB": i18next.t('commands.edit-game.options.highscore.name', { lng: 'en' }),
        "en-US": i18next.t('commands.edit-game.options.highscore.name', { lng: 'en' }),
        fr: i18next.t('commands.edit-game.options.highscore.name', { lng: 'fr' })
      })
      .setDescription(i18next.t('commands.edit-game.options.highscore.description', { lng: 'en' }))
      .setDescriptionLocalizations({
        "en-GB": i18next.t('commands.edit-game.options.highscore.description', { lng: 'en' }),
        "en-US": i18next.t('commands.edit-game.options.highscore.description', { lng: 'en' }),
        fr: i18next.t('commands.edit-game.options.highscore.description', { lng: 'fr' })
      })
      .setRequired(false)
    )
    .addUserOption(option => option
      .setName(i18next.t('commands.edit-game.options.highscore-member.name', { lng: 'en' }))
      .setNameLocalizations({
        "en-GB": i18next.t('commands.edit-game.options.highscore-member.name', { lng: 'en' }),
        "en-US": i18next.t('commands.edit-game.options.highscore-member.name', { lng: 'en' }),
        fr: i18next.t('commands.edit-game.options.highscore-member.name', { lng: 'fr' })
      })
      .setDescription(i18next.t('commands.edit-game.options.highscore-member.description', { lng: 'en' }))
      .setDescriptionLocalizations({
        "en-GB": i18next.t('commands.edit-game.options.highscore-member.description', { lng: 'en' }),
        "en-US": i18next.t('commands.edit-game.options.highscore-member.description', { lng: 'en' }),
        fr: i18next.t('commands.edit-game.options.highscore-member.description', { lng: 'fr' })
      })
      .setRequired(false)
    )
    .addRoleOption(option => option
      .setName(i18next.t('commands.edit-game.options.cat-role.name', { lng: 'en' }))
      .setNameLocalizations({
        "en-GB": i18next.t('commands.edit-game.options.cat-role.name', { lng: 'en' }),
        "en-US": i18next.t('commands.edit-game.options.cat-role.name', { lng: 'en' }),
        fr: i18next.t('commands.edit-game.options.cat-role.name', { lng: 'fr' })
      })
      .setDescription(i18next.t('commands.edit-game.options.cat-role.name', { lng: 'en' }))
      .setDescriptionLocalizations({
        "en-GB": i18next.t('commands.edit-game.options.cat-role.description', { lng: 'en' }),
        "en-US": i18next.t('commands.edit-game.options.cat-role.description', { lng: 'en' }),
        fr: i18next.t('commands.edit-game.options.cat-role.description', { lng: 'fr' })
      })
      .setRequired(false)
    )
    .addStringOption(option => option
      .setName(i18next.t('commands.edit-game.options.language.name', { lng: 'en' }))
      .setNameLocalizations({
        "en-GB": i18next.t('commands.edit-game.options.language.name', { lng: 'en' }),
        "en-US": i18next.t('commands.edit-game.options.language.name', { lng: 'en' }),
        fr: i18next.t('commands.edit-game.options.language.name', { lng: 'fr' })
      })
      .setDescription(i18next.t('commands.edit-game.options.language.name', { lng: 'en' }))
      .setDescriptionLocalizations({
        "en-GB": i18next.t('commands.edit-game.options.language.description', { lng: 'en' }),
        "en-US": i18next.t('commands.edit-game.options.language.description', { lng: 'en' }),
        fr: i18next.t('commands.edit-game.options.language.description', { lng: 'fr' })
      })
      .setRequired(false)
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
    if (inter.guildId == null || inter.channelId == null || inter.channel == null) return;

    const newHighScore = inter.options.getInteger(i18next.t('commands.edit-game.options.highscore.name', { lng: 'en' }));
    const newHighscoreHolder = inter.options.getUser(i18next.t('commands.edit-game.options.highscore-member.name', { lng: 'en' }));
    const catRole = inter.options.getRole(i18next.t('commands.edit-game.options.cat-role.name', { lng: 'en' }));
    const language = inter.options.getString(i18next.t('commands.edit-game.options.language.name', { lng: 'en' })) as addedLanguages;

    const supportedLanguages = Object.keys(i18next.services.resourceStore.data);

    if (newHighScore == null && newHighscoreHolder === null && catRole == null && language == null && supportedLanguages.includes(language) === false) {
      await inter.reply({
        content: "No changes were made.",
        ephemeral: true
      });
      return;
    }

    let listOfChanges = '';

    const currentGameMessage = (await inter.channel?.messages.fetch({ limit: 10 }))?.find(m => m.author.id === inter.client.user?.id && m.components.length > 0);

    if (currentGameMessage?.components[0].components[0].customId == null) {
      await inter.reply({
        content: "Could not find the current game in this channel. Make sure the game message (with the buttons) is in the last 10 messages.",
        ephemeral: true
      });
      return;
    }

    const currentGameCustomId = currentGameMessage.components[0].components[0].customId;

    const data = Object.assign({
      memberId: '',
      recordHolderId: ''
    }, parseCustomId(currentGameCustomId))

    if (newHighScore != null) {
      listOfChanges += `- The high score has been changed from ${data.maxScore} to ${newHighScore}.\n`;
      data.maxScore = newHighScore;
    }

    if (newHighscoreHolder != null) {
      listOfChanges += `- The high score holder has been changed from <@${data.recordHolderId}> to <@${newHighscoreHolder.id}>.\n`;
      data.recordHolderId = newHighscoreHolder.id;
    }

    if (catRole != null) {
      listOfChanges += `- The cat role has been changed from <@&${data.catRoleId}> to <@&${catRole.id}>.\n`;
      data.catRoleId = catRole.id;
    }

    if (language != null) {
      listOfChanges += `- The language has been changed from ${data.language} to ${language}.\n`;
      data.language = language;
    }

    await inter.reply({
      content: `The game has been updated with the following changes:
${listOfChanges.trim()}`,
      ephemeral: true
    });

    await currentGameMessage.delete();

    inter.channel.send({
      content: '',
      embeds: [await generateEmbed({
        ...data,
        guild: inter.guild!,
        channel: inter.channel,
        message: currentGameMessage
      }, data.currentScore, data.memberId)],
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            generateCountUpButton(
              generateCustomId(data),
              data.language
            ),
            generateExplanationButton(data.catRoleId, data.language),
            generateInviteServerButton(inter.client, data.language)
          )
      ],
      files: [
        logo
      ]
    });
  }
}

export default editGameCommand
