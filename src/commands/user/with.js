const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { User, Config } = require("../../../lib/models/schema"); // Asegúrate de que la ruta sea correcta
const { ChatCommand } = require("../../utils/commands");

module.exports = ChatCommand({
  name: "with",
  description: "Retira dinero de tu banco y lo coloca en efectivo",
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: "cantidad",
      description: "Cantidad de dinero a retirar del banco",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "all",
      description: "Retira todo el dinero del banco",
      required: false,
    },
  ],
  async execute(client, interaction) {
    const targetUser = interaction.user;
    const amountToWithdraw = interaction.options.getInteger("cantidad");
    const withdrawAll = interaction.options.getBoolean("all") || false;

    const userProfile = await User.findOne({
      username: targetUser.username,
      guildId: interaction.guild.id,
    });

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

    userProfile.balance.cash += withdrawalAmount;
    userProfile.balance.bank -= withdrawalAmount;
    userProfile.balance.total =
      userProfile.balance.cash + userProfile.balance.bank;
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
