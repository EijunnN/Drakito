const { ChatCommand } = require("../../utils/commands");
const { UserBetHistory, User } = require("../../../lib/models/schema");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { economyChannelIds } = require("../../utils/allowedChannels");

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
      if (!economyChannelIds.includes(channelId)) {
        return interaction.reply({
          content: "Este comando solo puede ser utilizado en canales permitidos.",
          ephemeral: true,
        });
      }
      // Obtener las estadísticas de apuestas del usuario
      const userStats = await getUserStats(targetUser.id);

      // Construir el mensaje o embed con las estadísticas
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setThumbnail(targetUser.displayAvatarURL())
        .setTitle(`Estadísticas de apuestas de ${targetUser.username}`)
        .addFields(
            { name: "Total de apuestas", value: `🎲 ${userStats.apuestasGanadas + userStats.apuestasPerdidas}`},
          { name: "Ganadas", value: `✅ ${userStats.apuestasGanadas}` },
          { name: "Perdidas", value: `❌ ${userStats.apuestasPerdidas}` },
          { name: "Máximo ganado", value: `💸 ${userStats.maxGanado}` },
          { name: "Máximo perdido", value: `💸 ${userStats.maxPerdido}` }
        );

      // Enviar el embed como respuesta
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
      // Buscar el documento de User utilizando el ID de Discord
      const user = await User.findOne({ discordId: discordUserId });
  
      if (!user) {
        // El usuario no existe en la base de datos
        return userStats;
      }
  
      // Obtener el historial de apuestas del usuario utilizando el _id del documento de User
      const userHistory = await UserBetHistory.find({ userId: user._id });
  
      // Calcular las estadísticas
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