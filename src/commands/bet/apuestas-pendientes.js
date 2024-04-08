// apuestasPendientes.js
const { ChatCommand } = require("../../utils/commands");
const { Bet, UserBet } = require("../../../lib/models/schema");
const { rolePermission } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "apuestas-pendientes",
  description: "Muestra las apuestas pendientes de veredicto",
  async execute(client, interaction) {
    if (!rolePermission.includes(interaction.member.roles.highest.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      // Obtener los IDs de las apuestas con apuestas de usuarios pendientes
      const pendingBetIds = await UserBet.distinct("betId", {
        status: "pending",
      });

      // Obtener las apuestas correspondientes a los IDs pendientes
      const bets = await Bet.find({ _id: { $in: pendingBetIds } });

      if (bets.length === 0) {
        return interaction.editReply({
          content: "No hay apuestas pendientes de veredicto en este momento.",
          ephemeral: true,
        });
      }

      // Separar las apuestas en partes para respetar el límite de caracteres
      const parts = [];
      let currentPart = "";
      for (const bet of bets) {
        const betText =
          `**Nº ${bets.indexOf(bet) + 1}**\n` +
          `**${bet.liga}** - ${bet.region}\n` +
          `**Evento:** ${bet.description}\n` +
          `**ID de la apuesta:** ${bet.betId}\n` +
          `**Opciones:**\n` +
          bet.bets
            .map(
              (b, index) =>
                `**${index + 1}**-${b.description} - Cuota: ${b.cuota}`
            )
            .join("\n") +
          "\n----------------\n";

        if (currentPart.length + betText.length > 2000) {
          // Si la parte actual excede el límite, guardarla y comenzar una nueva parte
          parts.push(currentPart);
          currentPart = betText;
        } else {
          // Si la parte actual no excede el límite, agregar el texto a la parte actual
          currentPart += betText;
        }
      }
      // Agregar la última parte
      parts.push(currentPart);

      // Enviar cada parte como un mensaje separado
      for (const part of parts) {
        await interaction.followUp({
          content: part,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error al obtener las apuestas pendientes:", error);
      return interaction.reply({
        content: "Ocurrió un error al obtener las apuestas pendientes.",
        ephemeral: true,
      });
    }
  },
});
