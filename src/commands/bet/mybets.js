const { ChatCommand } = require("../../utils/commands");
const { User, UserBetHistory } = require("../../../lib/models/schema");
const { EmbedBuilder } = require("discord.js");
const { format } = require("path");
const { economyChannelIds } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "mybets",
  description: "Muestra el historial de apuestas del usuario",
  async execute(client, interaction) {
    try {
      // Obtener el ID del usuario
      const userId = interaction.member.user.id;

      const channelId = interaction.channel.id;
      if (!economyChannelIds.includes(channelId)) {
        return interaction.reply({
          content: "Este comando solo puede ser utilizado en canales permitidos.",
          ephemeral: true,
        });
      }
      // Buscar el usuario en la base de datos
      const user = await User.findOne({ discordId: userId });
      if (!user) {
        return interaction.reply({
          content: "No se encontró al usuario en la base de datos.",
          ephemeral: true,
        });
      }

      // Obtener el historial de apuestas del usuario
      const betHistory = await UserBetHistory.find({ userId: user._id })
        .sort({
          createdAt: -1,
        })
        .limit(5);

      if (betHistory.length === 0) {
        return interaction.reply({
          content: "No tienes apuestas realizadas.",
          ephemeral: true,
        });
      }

      // funcion que formatee el precio de la ganancia de la apuesta en usd
      function formatPrice(price) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price);
      }
      // console.log(betHistory);
      // Crear un embed para mostrar el historial de apuestas
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(`Historial de apuestas de ${interaction.user.username}`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFields(
          betHistory.map((bet) => ({
            name: `Apuesta: ${bet.encuentro}`,
            value: `Info: ${bet.betInfo}\nOpcion :${
              bet.metodo
            }\nGanancia: ${formatPrice(bet.ganancia)}\nResultado: ${
              bet.outcome === "ganada"
                ? "Ganada"
                : bet.outcome === "perdida"
                ? "Perdida"
                : "Pendiente"
            }`,
          }))
        );

        
      // Enviar el embed como respuesta
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error al obtener el historial de apuestas:", error);
      return interaction.reply({
        content: "Ocurrió un error al obtener el historial de apuestas.",
        ephemeral: true,
      });
    }
  },
});
