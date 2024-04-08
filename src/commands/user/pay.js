// pay.js
const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User } = require("../../../lib/models/schema");
const { economyChannelIds } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "pay",
  description: "Transfiere dinero a otro usuario",
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "usuario",
      description: "Usuario al que pagar",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "cantidad",
      description: "Cantidad de dinero a transferir",
      required: true,
    },
  ],
  async execute(client, interaction) {
    const targetUser = interaction.options.getUser("usuario");
    const amount = interaction.options.getInteger("cantidad");
    const payerDiscordId = interaction.user.id;
    const recipientDiscordId = targetUser.id;

    if (amount <= 0) {
      return interaction.reply({
        content: "La cantidad debe ser mayor que cero.",
        ephemeral: true,
      });
    }

    const payer = await User.findOne({ discordId: payerDiscordId });
    if (!payer || payer.balance.cash < amount) {
      return interaction.reply({
        content:
          "No tienes suficiente dinero en efectivo para realizar esta transacción.",
        ephemeral: true,
      });
    }

    const recipient = await User.findOne({ discordId: recipientDiscordId });
    if (!recipient) {
      return interaction.reply({
        content: "El usuario destinatario no existe.",
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
    payer.balance.cash -= amount;
    recipient.balance.cash += amount;

    await payer.save();
    await recipient.save();

    return interaction.reply({
      content: `Has pagado $${amount} a ${targetUser.username}.`,
      ephemeral: true,
    });
  },
});
