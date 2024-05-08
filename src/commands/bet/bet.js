// bet.js
const { ChatCommand, createEmbed } = require("../../utils/commands");
const {
  User,
  Bet,
  UserBet,
  UserBetHistory,
  Config,
} = require("../../../lib/models/schema");
const {
  ApplicationCommandOptionType,
  MessageEmbed,
  EmbedBuilder,
} = require("discord.js");
const { default: mongoose } = require("mongoose");

module.exports = ChatCommand({
  name: "bet",
  description: "Permite a los usuarios realizar apuestas.",
  options: [
    {
      name: "id",
      description: "ID de la apuesta.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "option",
      description: "Opción elegida para apostar.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: "amount",
      description: "Cantidad de economía a apostar.",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  async execute(client, interaction) {
    // Obtener los datos de la interacción
    const betId = interaction.options.getString("id");
    const option = interaction.options.getInteger("option");
    const amount = interaction.options.getNumber("amount");
    const guildId = interaction.guild.id;

    const channelId = interaction.channel.id;

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

    try {
      const bet = await Bet.findOne({ betId, guildId: interaction.guildId });
      if (!bet) {
        return interaction.reply({
          content: "La apuesta especificada no existe.",
          ephemeral: true,
        });
      }

      if (bet.status !== "open") {
        return interaction.reply({
          content: "No puedes apostar en una apuesta cerrada.",
          ephemeral: true,
        });
      }

      if (option < 1 || option > bet.bets.length) {
        return interaction.reply({
          content: "La opción de apuesta especificada no es válida.",
          ephemeral: true,
        });
      }

      const userId = interaction.member.user.id;

      const user = await User.findOne({
        discordId: userId,
        guildId: interaction.guildId,
      });
      if (!user) {
        return interaction.reply({
          content: "No se encontró al usuario en la base de datos.",
          ephemeral: true,
        });
      }

      if (user.balance.bank < amount) {
        return interaction.reply({
          content:
            "No tienes suficiente economía en el banco para realizar esta apuesta.",
          ephemeral: true,
        });
      }

      const cuota = bet.bets[option - 1].cuota;
      const ganancia = (amount * cuota).toFixed(2);

      user.balance.bank -= amount;

      user.balance.total = user.balance.cash + user.balance.bank;

      await user.save();

      function formatPrice(ganancia) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(ganancia);
      }

      const userBet = new UserBet({
        guildId: interaction.guild.id,
        userId: user._id,
        betId: bet._id,
        codigo: bet.betId,
        amount,
        option,
      });
      await userBet.save();

      const userBetHistory = new UserBetHistory({
        guildId: interaction.guild.id,
        userId: user._id,
        betId: bet._id,
        betInfo: `${bet.liga}`,
        encuentro: `${bet.description}`,
        amount,
        outcome: "pending",
        metodo: bet.bets[option - 1].description,
        ganancia: ganancia,
      });
      await userBetHistory.save();

      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle("Apuesta realizada")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFields(
          {
            name: "Evento",
            value: bet.description,
          },
          {
            name: "Opción",
            value: bet.bets[option - 1].description,
          },
          {
            name: "Cuota",
            value: cuota.toString(),
          },
          {
            name: "Ganancia",
            value: `${formatPrice(ganancia)}`,
          }
        );

      return interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error("Error al procesar la apuesta:", error);
      return interaction.reply({
        content: "Ocurrió un error al procesar la apuesta.",
        ephemeral: true,
      });
    }
  },
});
