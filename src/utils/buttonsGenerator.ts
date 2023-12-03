import { ButtonBuilder, ButtonStyle, Client } from "discord.js";
import i18next from "i18next";
import { addedLanguages } from "../../@types/i18next";
import { generateInvite } from "./misc";

export function generateCountUpButton(customId: string, language: addedLanguages): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(i18next.t('buttons.increment', { lng: language }))
    .setStyle(ButtonStyle.Primary)
}

export function generateExplanationButton(catRoleId: string, language: addedLanguages): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(`explanation-${catRoleId}-${language}`)
    .setLabel(i18next.t('buttons.explanation', {
      lng: language
    }))
    .setStyle(ButtonStyle.Secondary);
}

export function generateInviteServerButton(client: Client, language: addedLanguages): ButtonBuilder {
  return new ButtonBuilder()
    .setLabel(i18next.t('buttons.add-to-server', { lng: language }))
    .setStyle(ButtonStyle.Link)
    .setURL(generateInvite(client));
}
