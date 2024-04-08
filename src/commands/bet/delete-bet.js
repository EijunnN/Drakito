const { ChatCommand } = require("../../utils/commands");
const { Bet, UserBet, UserBetHistory } = require("../../../lib/models/schema");
const { ApplicationCommandOptionType } = require("discord.js");
const { rolePermission } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "delete-bet",
  description: "Elimina una apuesta y devuelve el dinero a los usuarios que hayan apostado en ella.",
  options: [
    {
      name: "id",
      description: "ID de la apuesta a eliminar.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async execute(client, interaction) {
    // Obtener el ID de la apuesta a eliminar desde la interacción
    const betId = interaction.options.getString("id");

    if (!rolePermission.includes(interaction.member.roles.highest.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true,
      });
    }
    try {
      // Verificar si la apuesta existe
      const bet = await Bet.findOne({ betId });
      if (!bet) {
        return interaction.reply({
          content: "La apuesta especificada no existe.",
          ephemeral: true,
        });
      }

      // // Verificar si hay usuarios con apuestas pendientes en esta apuesta
      const pendingBets = await UserBet.find({ codigo : betId, status: "pending" });

      if (pendingBets.length > 0) {
        // Si hay apuestas pendientes, no se puede eliminar la apuesta
        return interaction.reply({
          content: "No se puede eliminar la apuesta porque hay usuarios con apuestas pendientes.",
          ephemeral: true,
        });
      }

      // Eliminar la apuesta
      await bet.deleteOne();

      // Respuesta exitosa
      return interaction.reply({
        content: "La apuesta ha sido eliminada correctamente.",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error al eliminar la apuesta:", error);
      return interaction.reply({
        content: "Ocurrió un error al eliminar la apuesta.",
        ephemeral: true,
      });
    }
  },
});