import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonInteraction, Colors, EmbedBuilder } from "discord.js";
import i18next from "i18next";
import { generateCustomId, getAllDataFromInteraction } from "../utils/data";
import { getUserData } from "../utils/misc";
import { generateCountUpButton, generateExplanationButton, generateInviteServerButton } from "../utils/buttonsGenerator";

export const logo = new AttachmentBuilder('./assets/logo.webp').setName('logo.webp')

const lastClickedButtonIds: Record<string, string> = {};

const FIVE_SECONDS = 5e3;
const TEN_SECONDS = 10e3;
const FIVE_MINUTES = 5 * 60e3;
const TEN_MINUTES = 10 * 60e3;

export async function onCountUpButtonClick(inter: ButtonInteraction): Promise<Promise<void>> {
  if (inter.guildId == null || inter.channelId == null || inter.member == null || lastClickedButtonIds[inter.channelId] === inter.customId) return;

  const now = new Date();

  const member = inter.guild!.members.cache.get(inter.member.user.id) ?? await inter.guild!.members.fetch(inter.member.user.id);

  const data = getAllDataFromInteraction(inter);

  const doesMemberHaveCatRole = member.roles.cache.has(data.catRoleId);

  const language = data.language;

  const minimumDateToClick = data.message.createdTimestamp + FIVE_MINUTES;

  if (doesMemberHaveCatRole) {
    inter.deferUpdate();

    if (data.currentScore !== 0) {
      catButtonPress(inter, data);
    }
  } else {

    if (data.currentScore > 0 && minimumDateToClick > now.getTime()) {

      inter.reply({
        content: i18next.t('interactions.count-up.too-soon', {
          delayTimestamp: Math.round(minimumDateToClick / 1000),
          lng: language
        }),
        ephemeral: true,
      });
      return;
    }

    lastClickedButtonIds[inter.channelId] = inter.customId;
    miceButtonPress(inter, data);
  }

}

async function miceButtonPress(inter: ButtonInteraction, data: ReturnType<typeof getAllDataFromInteraction>) {

  console.log(`[${new Date().toISOString()}] User ${inter.member!.user.username} clicked on the button ! Additional data : previous score ${data.currentScore}, memberId ${data.memberId}`);

  const member = inter.guild!.members.cache.get(inter.member!.user.id)!;

  await data.message.edit({
    content: i18next.t('messages.increment', {
      memberId: member.id,
      newScore: data.currentScore + 1,
      lng: data.language
    }),
    embeds: [],
    components: [],
    files: []
  });

  data.channel.send({
    content: '',
    embeds: [await generateEmbed(data, data.currentScore + 1, member.id)],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          generateCountUpButton(
            generateCustomId({
              currentScore: data.currentScore + 1,
              language: data.language,
              memberId: member.id,
              maxScore: Math.max(data.maxScore, data.currentScore + 1),
              recordHolderId: data.maxScore < data.currentScore + 1 ? member.id : (data.recordHolderId ?? ''),
              catRoleId: data.catRoleId
            }),
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

async function catButtonPress(inter: ButtonInteraction, data: ReturnType<typeof getAllDataFromInteraction>) {

  const member = inter.guild!.members.cache.get(inter.member!.user.id)!;

  await data.message.edit({
    content: i18next.t('messages.reset', {
      memberId: member.id,
      lng: data.language
    }),
    embeds: [],
    components: [],
    files: []
  });

  data.channel.send({
    content: '',
    embeds: [await generateEmbed(data, 0, member.id)],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          generateCountUpButton(
            generateCustomId({
              currentScore: 0,
              language: data.language,
              memberId: member.id,
              maxScore: data.maxScore,
              recordHolderId: data.recordHolderId ?? '',
              catRoleId: data.catRoleId
            }),
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

async function generateEmbed(data: ReturnType<typeof getAllDataFromInteraction>, newScore: number, clickingMemberId: string): Promise<EmbedBuilder> {
  let maxScore = data.maxScore;
  let maxScoreHolderId = data.recordHolderId;

  if (newScore > data.maxScore) {
    maxScore = newScore;
    maxScoreHolderId = clickingMemberId;
  }

  const embed =
    new EmbedBuilder()
      // .setTitle(`Score actuel : \`${newScore}\` !`)
      .setTitle(i18next.t('embed.title', {
        score: newScore,
        lng: data.language
      }))
      .setThumbnail('attachment://logo.webp')
      .setDescription(i18next.t('embed.description', { lng: data.language }))
      .setColor(Colors.Green)

  if (maxScoreHolderId != null) {
    embed.setFooter({
      text: i18next.t('embed.footer', {
        highScore: maxScore,
        highScoreMemberName: (await getUserData(maxScoreHolderId, data.guild.client))?.global_name ?? 'un inconnu',
        lng: data.language
      })
    })
  }

  return embed
}
