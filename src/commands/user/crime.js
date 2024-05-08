const { EmbedBuilder } = require("discord.js");
const { User, Config } = require("../../../lib/models/schema");
const { ChatCommand } = require("../../utils/commands");

const cooldowns = new Map();

module.exports = ChatCommand({
  name: "crime",
  description:
    "Intenta cometer un crimen para obtener efectivo (con riesgo de ser capturado)",
  async execute(client, interaction) {
    const user = interaction.user;
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

    if (cooldowns.has(user.id)) {
      const previousTime = cooldowns.get(user.id);
      const now = Date.now();
      const remainingTime = 1200000 - (now - previousTime);
      if (remainingTime > 0) {
        return interaction.reply({
          content: `Debes esperar ${Math.ceil(
            remainingTime / 60000
          )} minutos antes de poder cometer otro crimen.`,
          ephemeral: false,
        });
      }
    }

    let userProfile = await User.findOne({
      discordId: user.id,
      guildId: interaction.guild.id,
    });
    if (!userProfile) {
      userProfile = new User({
        discordId: user.id,
        guildId: interaction.guild.id,
        username: user.username,
        balance: {
          cash: 0,
          bank: 0,
          total: 0,
        },
      });
      await userProfile.save();
    }

    if (userProfile.balance.bank < 2000) {
      return interaction.reply({
        content:
          "¡No tienes suficiente efectivo en el banco para cometer un crimen!",
        ephemeral: false,
      });
    }

    const captureChance = Math.random(); // Genera un número aleatorio entre 0 y 1
    let isCaught = captureChance < 0.3; // Por ejemplo, el 30% de posibilidades de ser capturado

    let cashEarned = 0;
    if (!isCaught) {
      cashEarned = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // Entre 2000 y 5000 monedas
      userProfile.balance.cash += cashEarned;
      await userProfile.save();
    } else {
      const lossAmount = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // Entre 2000 y 5000 monedas
      userProfile.balance.bank -= lossAmount;
      await userProfile.save();
      cashEarned -= lossAmount;
    }

    userProfile.balance.total =
      userProfile.balance.cash + userProfile.balance.bank;
    await userProfile.save();

    cooldowns.set(user.id, Date.now());

    const formattedCashEarned = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(cashEarned));

    const crimeEmbed = new EmbedBuilder()
      .setColor(isCaught ? "Red" : "Green")
      .setDescription(
        isCaught
          ? `❌¡Oops! ${user.username} fue atrapado intentando cometer un crimen y perdió ${formattedCashEarned}.`
          : `🎈¡Felicidades! ${user.username} ha cometido un crimen exitosamente y ha ganado ${formattedCashEarned}.`
      );

    await interaction.reply({ embeds: [crimeEmbed] });
  },
});
