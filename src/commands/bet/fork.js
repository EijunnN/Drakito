// fork.js
const { ChatCommand } = require("../../utils/commands");
const { Bet } = require("../../../lib/models/schema");
const { ApplicationCommandOptionType } = require("discord.js");
const { Config } = require("../../../lib/models/schema");

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
      const id = interaction.options.getString("id");
      const estado = interaction.options.getString("estado");

      if (estado !== "open" && estado !== "closed") {
        return interaction.reply({
          content: "El estado proporcionado no es válido.",
          ephemeral: true,
        });
      }

      const bet = await Bet.findOne({
        guildId: interaction.guild.id,
        betId: id,
      });
      if (!bet) {
        return interaction.reply({
          content: "No se encontró una apuesta con el ID proporcionado.",
          ephemeral: true,
        });
      }

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
