const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User } = require("../../../lib/models/schema");
const { economyChannelIds } = require("../../utils/allowedChannels");
module.exports = ChatCommand({
  name: "dep",
  description: "Deposita dinero en efectivo al banco",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "cantidad",
      description: "Cantidad a depositar o 'all' para depositar todo",
      required: true,
    },
  ],
  async execute(client, interaction) {
    const discordId = interaction.user.id;
    const amountOrAll = interaction.options.getString("cantidad");

    // Buscar el perfil del usuario
    const userProfile = await User.findOne({ discordId: discordId });
    if (!userProfile) {
      return interaction.reply({
        content: "No se encontró tu perfil de usuario.",
        ephemeral: true,
      });
    }
    const channelId = interaction.channel.id;
    if (!economyChannelIds.includes(channelId)) {
      return interaction.reply({
        content: "Este comando solo puede ser utilizado en canales permitidos.",
        ephemeral: true,
      });
    }
    let amountToDeposit;
    if (amountOrAll.toLowerCase() === "all") {
      amountToDeposit = userProfile.balance.cash;
    } else {
      amountToDeposit = parseInt(amountOrAll);
      if (isNaN(amountToDeposit) || amountToDeposit <= 0) {
        return interaction.reply({
          content: "Por favor, introduce una cantidad válida para depositar.",
          ephemeral: true,
        });
      }
    }

    if (amountToDeposit > userProfile.balance.cash) {
      return interaction.reply({
        content:
          "No tienes suficiente dinero en efectivo para depositar esa cantidad.",
        ephemeral: true,
      });
    }

    // Realizar el depósito
    userProfile.balance.bank += amountToDeposit;
    userProfile.balance.cash -= amountToDeposit;
    userProfile.balance.total =
      userProfile.balance.cash + userProfile.balance.bank;
    await userProfile.save();

    return interaction.reply({
      content: `Has depositado con éxito $${amountToDeposit} a tu banco.`,
      ephemeral: true,
    });
  },
});
