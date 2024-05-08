const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User, Config } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "dep",
  description: "Deposita dinero en efectivo al banco",
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "cantidad",
      description: "Deposita una cantidad específica",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "monto",
          description: "Cantidad a depositar",
          required: true,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "all",
      description: "Deposita todo el dinero en efectivo",
    },
  ],
  async execute(client, interaction) {
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

    const userProfile = await User.findOne({
      discordId: discordId,
      guildId: interaction.guild.id,
    });
    if (!userProfile) {
      return interaction.reply({
        content: "No se encontró tu perfil de usuario.",
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "cantidad") {
      const amountStr = interaction.options.getString("monto");
      const amountToDeposit = parseInt(amountStr);

      if (isNaN(amountToDeposit) || amountToDeposit <= 0) {
        return interaction.reply({
          content: "Por favor, introduce una cantidad válida para depositar.",
          ephemeral: true,
        });
      }

      if (amountToDeposit > userProfile.balance.cash) {
        return interaction.reply({
          content:
            "No tienes suficiente dinero en efectivo para depositar esa cantidad.",
          ephemeral: true,
        });
      }

      userProfile.balance.bank += amountToDeposit;
      userProfile.balance.cash -= amountToDeposit;
      userProfile.balance.total =
        userProfile.balance.cash + userProfile.balance.bank;
      await userProfile.save();

      return interaction.reply({
        content: `Has depositado con éxito $${amountToDeposit} a tu banco.`,
        ephemeral: true,
      });
    } else if (subcommand === "all") {
      const cashAmount = userProfile.balance.cash;
      if (cashAmount <= 0) {
        return interaction.reply({
          content: "No tienes dinero en efectivo para depositar.",
          ephemeral: true,
        });
      }

      userProfile.balance.bank += cashAmount;
      userProfile.balance.cash = 0;
      userProfile.balance.total =
        userProfile.balance.cash + userProfile.balance.bank;
      await userProfile.save();

      return interaction.reply({
        content: `Has depositado con éxito $${cashAmount.toFixed(
          2
        )} a tu banco.`,
        ephemeral: true,
      });
    }
  },
});
