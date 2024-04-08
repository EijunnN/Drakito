// src/components/menus/impostores_win_method.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { UserModel, MatchModel } = require("../../../lib/models/schema");


module.exports = StringSelectMenu({
  customId: "impostores_win_method",
  async execute(client, interaction, reply) {
    const method = interaction.values[0];
    const channelId = interaction.member.voice.channelId;

    try {
      // Buscar la partida activa en MongoDB
      let storedMatch = await MatchModel.findOne({
        channelId: channelId,
        done: false,
      });

      if (!storedMatch) {
        reply.edit({ components: [] });
        return await interaction.followUp({
          content: "No encontré la partida :c",
          ephemeral: true,
        });
      }

      // Actualizar el método de victoria y el ganador en la partida
      storedMatch.winMethod = method;
      storedMatch.winner = "impostores";
      await storedMatch.save();

      // Actualizar perfiles de usuarios y asignar puntos
      //  for (const userId of storedMatch.participants) {
      //   const isWinner = storedMatch.impostors.includes(userId);
      //   const isMvp =   userId === storedMatch.mvpId;
      //   const role = storedMatch.impostors.includes(userId) ? "impostor" : "crewmate";
      //   await updateUserProfile(userId, isWinner, isMvp, role, method);
      // }

      // await Promise.all(
      //   storedMatch.impostors.map(async (userId) => {
      //     await updateUserProfile(
      //       userId,
      //       true,
      //       false,
      //       "impostor",
      //       storedMatch._id
      //     );
      //   })
      // );

      // // Actualizar el perfil de los tripulantes (perdedores)
      // await Promise.all(
      //   storedMatch.crewmates.map(async (userId) => {
      //     await updateUserProfile(
      //       userId,
      //       false,
      //       false,
      //       "crewmate",
      //       storedMatch._id
      //     );
      //   })
      // );
      // Informar que los puntos han sido asignados
      await reply.edit({
        content: "Puntos asignados a los impostores.",
        components: [],
      });

      // Preparar el menú para seleccionar el MVP
      const mvpOptions = storedMatch.crewmates
        .concat(storedMatch.impostors)
        .map((userId) => {
          const member = interaction.guild.members.cache.get(userId);
          return {
            label: member ? member.displayName : `ID: ${userId}`,
            value: userId,
            description: member.user.username,
          };
        });

      const mvpMenu = new StringSelectMenuBuilder()
        .setCustomId("select-mvp")
        .setPlaceholder("Selecciona el MVP de la partida")
        .addOptions(mvpOptions);

      await reply.edit({
        content: "Por favor, selecciona el MVP de la partida:",
        components: [new ActionRowBuilder().addComponents(mvpMenu)],
      });
    } catch (error) {
      console.error(
        "Error al procesar el método de victoria de los impostores:",
        error
      );
      await interaction.followUp({
        content: "Hubo un error al procesar tu solicitud.",
        ephemeral: true,
      });
    }
  },
});
