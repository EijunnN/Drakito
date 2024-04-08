const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User } = require("../../../lib/models/schema");
const { economyChannelIds } = require("../../utils/allowedChannels");
module.exports = ChatCommand({
  name: "codigo",
  description: "Establece o cambia tu código de banco",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "codigo",
      description: "Tu nuevo código de banco",
      required: true,
    },
  ],
  async execute(client, interaction) {
    const newCode = interaction.options.getString("codigo");
    const discordId = interaction.user.id;

    const channelId = interaction.channel.id;
    if (!economyChannelIds.includes(channelId)) {
      return interaction.reply({
        content: "Este comando solo puede ser utilizado en canales permitidos.",
        ephemeral: true,
      });
    }
    // Comprobar si el código ya está en uso por otro usuario
    const existingCode = await User.findOne({ bankCode: newCode });
    if (existingCode && existingCode.discordId !== discordId) {
      return interaction.reply({
        content:
          "Este código ya está en uso por otro usuario. Por favor, elige un código diferente.",
        ephemeral: true,
      });
    }

    // Buscar el perfil del usuario y actualizar su código de banco
    const userProfile = await User.findOneAndUpdate(
      { discordId: discordId },
      { bankCode: newCode },
      { new: true }
    );

    if (!userProfile) {
      return interaction.reply({
        content: "Perfil de usuario no encontrado.",
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `Tu código de banco ha sido actualizado a: ${newCode}`,
      ephemeral: true,
    });
  },
});
