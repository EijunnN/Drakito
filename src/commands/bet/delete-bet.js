// delete-bet.js
const { ChatCommand } = require("../../utils/commands");
const {
  Bet,
  UserBet,
  UserBetHistory,
  Config,
} = require("../../../lib/models/schema");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = ChatCommand({
  name: "delete-bet",
  description:
    "Elimina una apuesta y devuelve el dinero a los usuarios que hayan apostado en ella.",
  options: [
    {
      name: "id",
      description: "ID de la apuesta a eliminar.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async execute(client, interaction) {
    const betId = interaction.options.getString("id");
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

    try {
      const bet = await Bet.findOne({ betId, guildId: interaction.guildId });
      if (!bet) {
        return interaction.reply({
          content: "La apuesta especificada no existe.",
          ephemeral: true,
        });
      }

      const pendingBets = await UserBet.find({
        guildId: interaction.guild.id,
        codigo: betId,
        status: "pending",
      });

      if (pendingBets.length > 0) {
        return interaction.reply({
          content:
            "No se puede eliminar la apuesta porque hay usuarios con apuestas pendientes.",
          ephemeral: true,
        });
      }

      await bet.deleteOne();

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
