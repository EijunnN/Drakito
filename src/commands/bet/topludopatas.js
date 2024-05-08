// topludopatas.js
const { ChatCommand } = require("../../utils/commands");
const { UserBetHistory, User, Config } = require("../../../lib/models/schema");
const { EmbedBuilder } = require("discord.js");


module.exports = ChatCommand({
  name: "topludopatas",
  description:
    "Muestra los 10 mejores ludópatas basados en la cantidad total de apuestas realizadas.",
  async execute(client, interaction) {
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
    try {
      // Obtener los 10 mejores ludópatas basados en la cantidad total de apuestas realizadas
      const topLudopatas = await getTopLudopatas(interaction.guild.id);
      // Si no hay resultados, enviar un mensaje indicando que no hay ludópatas
      if (topLudopatas.length === 0) {
        return interaction.reply({
          content: "No hay ludópatas en este momento.",
          ephemeral: true,
        });
      }
      // Construir el mensaje o embed con los mejores ludópatas
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle("Top 10 Ludópatas")
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(
          "Los 10 usuarios con la mayor cantidad total de apuestas realizadas."
        )
        .setFields(
          topLudopatas.map((ludopata, index) => ({
            name: `${index + 1}. ${ludopata.username} | 🎲${
              ludopata.totalApuestas
            }`,
            value: " ",
            inline: false,
          }))
        );

      // Enviar el embed como respuesta
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al obtener el top de ludópatas:", error);
      return interaction.reply({
        content: "Ocurrió un error al obtener el top de ludópatas.",
        ephemeral: true,
      });
    }
  },
});

async function getTopLudopatas() {
  try {
    // Agregar una nueva etapa de agregación para agrupar y sumar la cantidad de apuestas por usuario
    const topLudopatas = await UserBetHistory.aggregate([
      { $match: { guildId } },
      {
        $group: {
          _id: "$userId",
          totalApuestas: { $sum: 1 }, // Sumar la cantidad de apuestas por cada usuario
        },
      },
      {
        $sort: { totalApuestas: -1 }, // Ordenar por la cantidad total de apuestas en orden descendente
      },
      {
        $limit: 10, // Limitar a los 10 primeros resultados
      },
    ]);

    // Mapear los resultados para obtener más detalles de los usuarios
    const topLudopatasDetails = await Promise.all(
      topLudopatas.map(async (ludopata) => {
        const user = await User.findById(ludopata._id);
        return {
          _id: user._id,
          username: user.username,
          totalApuestas: ludopata.totalApuestas,
        };
      })
    );

    return topLudopatasDetails;
  } catch (error) {
    console.error("Error al obtener el top de ludópatas:", error);
    return [];
  }
}
