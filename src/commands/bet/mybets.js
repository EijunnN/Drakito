// mybets.js

const { ChatCommand } = require("../../utils/commands");
const { User, UserBetHistory, Config } = require("../../../lib/models/schema");
const { EmbedBuilder } = require("discord.js");
const { format } = require("path");

module.exports = ChatCommand({
  name: "mybets",
  description: "Muestra el historial de apuestas del usuario",
  async execute(client, interaction) {
    try {
      const userId = interaction.member.user.id;

      const channelId = interaction.channel.id;
      const guildId = interaction.guild.id;

      const allowedChannels = await Config.findOne({
        guildId,
        key: "allowedChannels",
      });

      if (!allowedChannels || !allowedChannels.value.includes(channelId)) {
        return interaction.reply({
          content:
            "Este comando solo puede ser utilizado en canales permitidos.",
          ephemeral: true,
        });
      }

      const user = await User.findOne({
        discordId: userId,
        guildId: interaction.guild.id,
      });
      if (!user) {
        return interaction.reply({
          content: "No se encontró al usuario en la base de datos.",
          ephemeral: true,
        });
      }

      const betHistory = await UserBetHistory.find({
        guildId: interaction.guild.id,
        userId: user._id,
      })
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

      function formatPrice(price) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price);
      }
      // console.log(betHistory);

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
