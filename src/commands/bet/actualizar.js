// actualizar.js
const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { actualizarApuestas } = require("../../core/functions/betData");

const { Config } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "actualizar",
  description: "Actualiza las apuestas disponibles",
  async execute(client, interaction) {
    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

    const adminRoles = await Config.findOne({ guildId, key: "adminRoles" });
    
    if (!adminRoles || !adminRoles.value.some(roleId => interaction.member.roles.cache.has(roleId))) {
      return interaction.reply({
        content: "No tienes permisos para utilizar este comando.",
        ephemeral: true,
      });
    }
    await interaction.deferReply();

    try {
      const guildId = interaction.guild.id;
      await actualizarApuestas(guildId);

      return interaction.editReply({
        content: "¡Las apuestas se han actualizado correctamente!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error al actualizar las apuestas:", error);
      return interaction.editReply({
        content: "Ocurrió un error al actualizar las apuestas.",
        ephemeral: true,
      });
    }
  },
});