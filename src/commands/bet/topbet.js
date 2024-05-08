// topbet.js
const { ChatCommand } = require("../../utils/commands");
const { Bet, UserBetHistory, Config } = require("../../../lib/models/schema");
const { EmbedBuilder } = require("discord.js");


module.exports = ChatCommand({
  name: "topbets",
  description: "Muestra las 10 apuestas más populares sobre los encuentros.",
  async execute(client, interaction) {
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

    try {
      // Obtener las 10 apuestas más populares sobre los encuentros
      const topBets = await UserBetHistory.aggregate([
        { $match: { guildId: interaction.guild.id, outcome: "pending" } },
        // Agrupar las apuestas por encuentro
        { $group: { _id: "$encuentro", count: { $sum: 1 } } },
        // Ordenar los encuentros por cantidad de apuestas en orden descendente
        { $sort: { count: -1 } },
        // Limitar los resultados a los primeros 10 encuentros
        { $limit: 10 },
      ]);
 
      if (topBets.length === 0) {
        return interaction.reply({
          content: "No hay apuestas populares en este momento.",
          ephemeral: true,
        });
      }
      // Crear un mensaje o embed para mostrar las apuestas populares
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setThumbnail(interaction.guild.iconURL())
        .setTitle("Top 10 de Apuestas Populares")
        .setDescription("Las 10 apuestas más populares sobre los encuentros:")
        .setFields(
          topBets.map((bet, index) => ({
            name: `${index + 1}. ${bet._id} | \`⚽${bet.count}\``,
            value: " ",
            inline: false,
          }))
        );

      // Enviar el embed como respuesta
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al obtener las apuestas más populares:", error);
      return interaction.reply({
        content: "Ocurrió un error al obtener las apuestas más populares.",
        ephemeral: true,
      });
    }
  },
});
