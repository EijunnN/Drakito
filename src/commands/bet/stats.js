// stats.js
const { ChatCommand } = require("../../utils/commands");
const { UserBetHistory, User, Config } = require("../../../lib/models/schema");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = ChatCommand({
  name: "stats",
  description: "Muestra las estadísticas de apuestas del usuario.",
  options: [
    {
      name: "user",
      description: "Usuario del cual se desean ver las estadísticas.",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  async execute(client, interaction) {
    try {
      let targetUser = interaction.options.getUser("user");
      if (!targetUser) {
        targetUser = interaction.member.user;
      }
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

      const userStats = await getUserStats(interaction.guild.id, targetUser.id);

      const embed = new EmbedBuilder()
        .setColor("Random")
        .setThumbnail(targetUser.displayAvatarURL())
        .setTitle(`Estadísticas de apuestas de ${targetUser.username}`)
        .addFields(
          {
            name: "Total de apuestas",
            value: `🎲 ${
              userStats.apuestasGanadas + userStats.apuestasPerdidas
            }`,
          },
          { name: "Ganadas", value: `✅ ${userStats.apuestasGanadas}` },
          { name: "Perdidas", value: `❌ ${userStats.apuestasPerdidas}` },
          { name: "Máximo ganado", value: `💸 ${userStats.maxGanado}` },
          { name: "Máximo perdido", value: `💸 ${userStats.maxPerdido}` }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al obtener las estadísticas de apuestas:", error);
      return interaction.reply({
        content: "Ocurrió un error al obtener las estadísticas de apuestas.",
        ephemeral: true,
      });
    }
  },
});

async function getUserStats(discordUserId) {
  const userStats = {
    apuestasGanadas: 0,
    apuestasPerdidas: 0,
    maxGanado: 0,
    maxPerdido: 0,
  };

  try {
    const user = await User.findOne({ discordId: discordUserId });

    if (!user) {
      return userStats;
    }

    const userHistory = await UserBetHistory.find({
      guildId,
      userId: user._id,
    });

    userHistory.forEach((bet) => {
      const amount = bet.amount;
      const outcome = bet.outcome;

      if (outcome === "ganada") {
        userStats.apuestasGanadas++;
        const ganancia = bet.ganancia - amount;
        if (ganancia > userStats.maxGanado) {
          userStats.maxGanado = ganancia;
        }
      } else if (outcome === "perdida") {
        userStats.apuestasPerdidas++;
        const perdida = amount;
        if (perdida > userStats.maxPerdido) {
          userStats.maxPerdido = perdida;
        }
      }
    });
  } catch (error) {
    console.error("Error al obtener las estadísticas de apuestas:", error);
  }

  return userStats;
}
