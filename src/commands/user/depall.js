const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User } = require("../../../lib/models/schema");
const { economyChannelIds } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "depall",
  description: "Deposita todo tu dinero en efectivo al banco",
  // options: [],
  async execute(client, interaction) {
    const discordId = interaction.user.id;

    // Buscar el perfil del usuario
    const userProfile = await User.findOne({ discordId: discordId });

    const channelId = interaction.channel.id;
    if (!economyChannelIds.includes(channelId)) {
      return interaction.reply({
        content: "Este comando solo puede ser utilizado en canales permitidos.",
        ephemeral: true,
      });
    }

    if (!userProfile) {
      return interaction.reply({
        content: "No se encontró tu perfil de usuario.",
        ephemeral: true,
      });
    }

    const cashAmount = userProfile.balance.cash;
    if (cashAmount <= 0) {
      return interaction.reply({
        content: "No tienes dinero en efectivo para depositar.",
        ephemeral: true,
      });
    }

    // Realizar el depósito
    userProfile.balance.bank += cashAmount;
    userProfile.balance.cash = 0;
    userProfile.balance.total =
      userProfile.balance.cash + userProfile.balance.bank;
    await userProfile.save();

    return interaction.reply({
      content: `Has depositado con éxito $${cashAmount.toFixed(2)} a tu banco.`,
      ephemeral: true,
    });
  },
});
