import { ButtonInteraction } from "discord.js";
import { addedLanguages } from "../../@types/i18next";

export function generateCustomId({ memberId, recordHolderId, currentScore, maxScore, catRoleId, language }: { memberId: string, recordHolderId: string, currentScore: number, maxScore: number, catRoleId: string, language: addedLanguages }): string {
  return `count-${memberId}-${currentScore}-${recordHolderId}-${maxScore}-${catRoleId}-${language}`;
}

export function parseCustomId(customId: string): { memberId: string | undefined, recordHolderId: string | undefined, currentScore: number, maxScore: number, catRoleId: string, language: addedLanguages } {
  const [, memberId, currentScore, recordHolderId, maxScore, catRoleId, language] = customId.split('-');
  return {
    memberId: memberId === '' ? undefined : memberId,
    currentScore: parseInt(currentScore),
    recordHolderId: recordHolderId === '' ? undefined : recordHolderId,
    maxScore: parseInt(maxScore),
    catRoleId,
    language: language as addedLanguages,
  };
}

export function getAllDataFromInteraction(inter: ButtonInteraction) {
  return {
    ...parseCustomId(inter.customId),
    guild: inter.guild!,
    channel: inter.channel!,
    message: inter.message,
  }
}

export type AllDataFromInteraction = ReturnType<typeof getAllDataFromInteraction>;
