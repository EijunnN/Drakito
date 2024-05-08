// ./src/commands/admin/permisos.js
const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { Config } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "permisos",
  description: "Administra los permisos de canales y roles para comandos sensibles",
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "agregar",
      description: "Agrega permisos a un canal o rol",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "tipo",
          description: "Tipo de permiso (canal/rol)",
          required: true,
          choices: [
            { name: "canal", value: "canal" },
            { name: "rol", value: "rol" },
          ],
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "id",
          description: "ID del canal o rol",
          required: true,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "remover",
      description: "Remueve permisos de un canal o rol",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "tipo",
          description: "Tipo de permiso (canal/rol)",
          required: true,
          choices: [
            { name: "canal", value: "canal" },
            { name: "rol", value: "rol" },
          ],
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "id",
          description: "ID del canal o rol",
          required: true,
        },
      ],
    },
  ],
  async execute(client, interaction) {
    const guildId = interaction.guild.id;

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content: "No tienes permiso de ADMINISTRADOR para usar este comando.",
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const tipo = interaction.options.getString("tipo");
    const id = interaction.options.getString("id");

    if (subcommand === "agregar") {
      const configKey = tipo === "canal" ? "allowedChannels" : "adminRoles";

      const config = await Config.findOneAndUpdate(
        { guildId, key: configKey },
        { $addToSet: { value: id } },
        { upsert: true, new: true }
      );

      
      return interaction.reply({
        content: `Se agregaron permisos al ${tipo} con ID ${id}.`,
        ephemeral: false,
      });

      
      
    } else if (subcommand === "remover") {
      const configKey = tipo === "canal" ? "allowedChannels" : "adminRoles";

      const config = await Config.findOneAndUpdate(
        { guildId, key: configKey },
        { $pull: { value: id } },
        { new: true }
      );

      if (config) {
        return interaction.reply({
          content: `Se removieron permisos del ${tipo} con ID ${id}.`,
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          content: `El ${tipo} con ID ${id} no tiene permisos.`,
          ephemeral: true,
        });
      }
    }
  },
});