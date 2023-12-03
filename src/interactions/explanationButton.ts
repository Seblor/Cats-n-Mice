import { ButtonInteraction } from "discord.js";
import i18next from "i18next";
import { addedLanguages } from "../../@types/i18next";

export function explainGame(inter: ButtonInteraction) {
  const [, catRoleId, language] = inter.customId.split('-') as [never, string, addedLanguages];

  inter.reply({
    content: i18next.t('interactions.explanation-button.explanation', {
      catRoleId,
      lng: language
    }),
    ephemeral: true,
  });
}