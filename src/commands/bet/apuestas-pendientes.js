// apuestasPendientes.js
const { ChatCommand } = require("../../utils/commands");
const { Bet, UserBet, Config } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "apuestas-pendientes",
  description: "Muestra las apuestas pendientes de veredicto",
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const adminRoles = await Config.findOne({ guildId, key: "adminRoles" });

    if (
      !adminRoles ||
      !adminRoles.value.some((roleId) =>
        interaction.member.roles.cache.has(roleId)
      )
    ) {
      return interaction.reply({
        content: "No tienes permisos para utilizar este comando.",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const pendingBetIds = await UserBet.distinct("betId", {
        guildId: interaction.guild.id,
        status: "pending",
      });

      const bets = await Bet.find({
        _id: { $in: pendingBetIds },
        status: "closed",
      });

      if (bets.length === 0) {
        return interaction.editReply({
          content: "No hay apuestas pendientes de veredicto en este momento.",
          ephemeral: true,
        });
      }

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
          parts.push(currentPart);
          currentPart = betText;
        } else {
          currentPart += betText;
        }
      }

      parts.push(currentPart);

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
