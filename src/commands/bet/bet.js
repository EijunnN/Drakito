// bet.js
const { ChatCommand, createEmbed } = require("../../utils/commands");
const { User, Bet, UserBet, UserBetHistory } = require("../../../lib/models/schema");
const {
  ApplicationCommandOptionType,
  MessageEmbed,
  EmbedBuilder,
} = require("discord.js");
const { default: mongoose } = require("mongoose");
const { economyChannelIds } = require("../../utils/allowedChannels");

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

    const channelId = interaction.channel.id;
    if (!economyChannelIds.includes(channelId)) {
      return interaction.reply({
        content: "Este comando solo puede ser utilizado en canales permitidos.",
        ephemeral: true,
      });
    }
    try {
      // Verificar la existencia de la apuesta
      const bet = await Bet.findOne({ betId });
      if (!bet) {
        return interaction.reply({
          content: "La apuesta especificada no existe.",
          ephemeral: true,
        });
      }

      // Verificar si la apuesta está cerrada
      if (bet.status !== "open") {
        return interaction.reply({
          content: "No puedes apostar en una apuesta cerrada.",
          ephemeral: true,
        });
      }

      // Verificar la opción de apuesta
      if (option < 1 || option > bet.bets.length) {
        return interaction.reply({
          content: "La opción de apuesta especificada no es válida.",
          ephemeral: true,
        });
      }

      // Obtener el usuario
      const userId = interaction.member.user.id;
      const user = await User.findOne({ discordId: userId });
      if (!user) {
        return interaction.reply({
          content: "No se encontró al usuario en la base de datos.",
          ephemeral: true,
        });
      }

      // Verificar si el usuario tiene suficiente economía en el banco
      if (user.balance.bank < amount) {
        return interaction.reply({
          content:
            "No tienes suficiente economía en el banco para realizar esta apuesta.",
          ephemeral: true,
        });
      }

      // Calcular la ganancia para la apuesta
      const cuota = bet.bets[option - 1].cuota;
      const ganancia = (amount * cuota).toFixed(2);

      // Descontar la economía del usuario del saldo del banco
      user.balance.bank -= amount;

      // Actualizar el balance total del usuario
      user.balance.total = user.balance.cash + user.balance.bank;

      // Guardar los cambios en el usuario
      await user.save();

      function formatPrice(ganancia) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(ganancia);
      }
      // Registrar la apuesta
      const userBet = new UserBet({
        userId: user._id,
        betId: bet._id,
        codigo : bet.betId,
        amount,
        option,
      });
      await userBet.save();

      const userBetHistory = new UserBetHistory({
        userId: user._id,
        betId: bet._id,
        betInfo: `${bet.liga}`,
        encuentro : `${bet.description}`,
        amount,
        outcome: "pending",
        metodo : bet.bets[option - 1].description,
        ganancia : ganancia,
      });
      await userBetHistory.save();

      // Crear un embed para la respuesta
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

      // Respuesta exitosa con el embed
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
