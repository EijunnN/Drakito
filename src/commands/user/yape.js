const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User, Config } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "yape",
  description: "Establece o cambia tu código de banco",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "yape",
      description: "Tu nuevo código de banco",
      required: true,
    },
  ],
  async execute(client, interaction) {
    const newCode = interaction.options.getString("yape");
    const discordId = interaction.user.id;

    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;
    const allowedChannels = await Config.findOne({
      guildId,
      key: "allowedChannels",
    });

    if (!allowedChannels || !allowedChannels.value.includes(channelId)) {
      return interaction.reply({
        content: "Este comando solo puede ser utilizado en canales permitidos.",
        ephemeral: true,
      });
    }

    const existingCode = await User.findOne({
      guildId: interaction.guild.id,
      bankCode: newCode,
    });
    if (existingCode && existingCode.discordId !== discordId) {
      return interaction.reply({
        content:
          "Este código ya está en uso por otro usuario. Por favor, elige un código diferente.",
        ephemeral: true,
      });
    }

    const userProfile = await User.findOneAndUpdate(
      { discordId: discordId, guildId: interaction.guild.id },
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
