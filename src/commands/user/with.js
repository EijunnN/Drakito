// ./src/commands/user/with.js
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { User } = require("../../../lib/models/schema"); // Asegúrate de que la ruta sea correcta
const { ChatCommand } = require("../../utils/commands");
const { economyChannelIds } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "with",
  description: "Retira dinero de tu banco y lo coloca en efectivo",
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: "cantidad",
      description: "Cantidad de dinero a retirar del banco",
      required: false, // no es requerido para permitir retirar todo
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "all",
      description: "Retira todo el dinero del banco",
      required: false, // no es requerido para permitir retirar una cantidad específica
    },
  ],
  async execute(client, interaction) {
    const targetUser = interaction.user;
    const amountToWithdraw = interaction.options.getInteger("cantidad");
    const withdrawAll = interaction.options.getBoolean("all") || false;

    const userProfile = await User.findOne({ username: targetUser.username });

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

    let withdrawalAmount = 0;

    if (withdrawAll) {
      withdrawalAmount = userProfile.balance.bank;
    } else {
      if (amountToWithdraw <= 0) {
        return interaction.reply({
          content: "La cantidad a retirar debe ser mayor que cero.",
          ephemeral: true,
        });
      }
      if (amountToWithdraw > userProfile.balance.bank) {
        return interaction.reply({
          content:
            "No tienes suficiente dinero en el banco para retirar esa cantidad.",
          ephemeral: true,
        });
      }
      withdrawalAmount = amountToWithdraw;
    }

    // Actualizar balances del usuario
    userProfile.balance.cash += withdrawalAmount;
    userProfile.balance.bank -= withdrawalAmount;
    userProfile.balance.total =
      userProfile.balance.cash + userProfile.balance.bank; // Asegúrate de actualizar el balance total
    await userProfile.save();

    const balanceEmbed = new EmbedBuilder()
      .setAuthor({
        name: targetUser.tag,
        iconURL: targetUser.displayAvatarURL(),
      })
      .setColor("Random")
      .addFields(
        {
          name: "Cantidad Retirada",
          value: `💵 ${withdrawalAmount.toLocaleString()}`,
          inline: true,
        },
        {
          name: "Cash",
          value: `💵 ${userProfile.balance.cash.toLocaleString()}`,
          inline: true,
        },
        {
          name: "Bank",
          value: `🏦 ${userProfile.balance.bank.toLocaleString()}`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [balanceEmbed] });
  },
});
