const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User, Transaction, Config } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "transferir",
  description: "Transfiere dinero a otro usuario mediante código de banco",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "codigo",
      description: "Código de banco del destinatario",
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
    const bankCode = interaction.options.getString("codigo");
    const amount = interaction.options.getInteger("cantidad");
    const senderDiscordId = interaction.user.id;

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

    if (amount <= 0) {
      return interaction.reply({
        content: "La cantidad debe ser mayor que cero.",
        ephemeral: true,
      });
    }

    const sender = await User.findOne({
      discordId: senderDiscordId,
      guildId: interaction.guild.id,
    });
    const recipient = await User.findOne({
      bankCode: bankCode,
      guildId: interaction.guild.id,
    });

    if (!sender || sender.balance.cash < amount) {
      return interaction.reply({
        content:
          "No tienes suficiente dinero en efectivo para esta transferencia.",
        ephemeral: true,
      });
    }

    if (!recipient) {
      return interaction.reply({
        content: "Código de banco no encontrado.",
        ephemeral: true,
      });
    }

    sender.balance.cash -= amount;
    recipient.balance.bank += amount;

    // Registrar la transacción
    const newTransaction = new Transaction({
      type: "transfer",
      fromUserId: sender._id,
      toUserId: recipient._id,
      amount: amount,
      date: new Date(),
      reason: `Transferencia a código de banco ${bankCode}`,
    });

    await newTransaction.save();
    await sender.save();
    await recipient.save();

    return interaction.reply({
      content: `Has transferido $${amount} al banco del usuario con código ${bankCode}.`,
      ephemeral: true,
    });
  },
});
