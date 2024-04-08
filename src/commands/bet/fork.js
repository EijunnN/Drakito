// fork.js
const { ChatCommand } = require("../../utils/commands");
const { Bet } = require("../../../lib/models/schema");
const { ApplicationCommandOptionType } = require("discord.js");
const { rolePermission } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "fork",
  description: "Permite cambiar el estado de una apuesta por su ID.",
  options: [
    {
      name: "id",
      description: "ID de la apuesta.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "estado",
      description: "Nuevo estado de la apuesta (abierta o cerrada).",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Abierta", value: "open" },
        { name: "Cerrada", value: "closed" },
      ],
    },
  ],
  async execute(client, interaction) {
    // await interaction.deferReply();

    if (!rolePermission.includes(interaction.member.roles.highest.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true,
      });
    }
    try {
      const id = interaction.options.getString("id");
      const estado = interaction.options.getString("estado");

      // Verificar si el estado proporcionado es válido
      if (estado !== "open" && estado !== "closed") {
        return interaction.reply({
          content: "El estado proporcionado no es válido.",
          ephemeral: true,
        });
      }

      // Buscar la apuesta por su ID
      const bet = await Bet.findOne({ betId: id });
      if (!bet) {
        return interaction.reply({
          content: "No se encontró una apuesta con el ID proporcionado.",
          ephemeral: true,
        });
      }

      // Cambiar el estado de la apuesta
      bet.status = estado;
      await bet.save();

      return interaction.reply({
        content: `El estado de la apuesta con ID ${id} ha sido cambiado a ${estado}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error al cambiar el estado de la apuesta:", error);
      return interaction.reply({
        content: "Ocurrió un error al cambiar el estado de la apuesta.",
        ephemeral: true,
      });
    }
  },
});
