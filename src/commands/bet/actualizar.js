// actualizar.js
const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { actualizarApuestas } = require("../../core/functions/betData");
const { rolePermission } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "actualizar",
  description: "Actualiza las apuestas disponibles",
  async execute(client, interaction) {
    if (!rolePermission.includes(interaction.member.roles.highest.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true,
      });
    }
    await interaction.deferReply();

    try {
      await actualizarApuestas();
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
