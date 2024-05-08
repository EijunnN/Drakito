const { Button } = require("../../utils/components");
const { User } = require("../../../lib/models/schema");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = Button({
  customId: "next_page",
  async execute(client, interaction) {
    // Extraer la página actual del embed
    const embed = interaction.message.embeds[0];
    const footerText = embed.footer.text;
    const currentPage = parseInt(footerText.match(/Página (\d+) de (\d+)/)[1]);
    const totalPages = parseInt(footerText.match(/Página (\d+) de (\d+)/)[2]);
    const nextPage = currentPage + 1;

    // Comprobar si ya estamos en la última página
    if (currentPage >= totalPages) {
      return interaction.reply({
        content: "Ya estás en la última página.",
        ephemeral: true,
      });
    }

    // Configuración de la paginación
    const usersPerPage = 10;

    // Obtener los usuarios para la próxima página
    const users = await User.find({ guildId: interaction.guild.id })
      .sort({ "balance.total": -1 })
      .skip((nextPage - 1) * usersPerPage)
      .limit(usersPerPage);

    // Crear un nuevo embed para la próxima página
    const newEmbed = new EmbedBuilder()
      .setTitle(`${interaction.guild.name} - Leaderboard`)
      .setColor("Random")
      .setFooter({ text: `Página ${nextPage} de ${totalPages}` });

    users.forEach((user, index) => {
      newEmbed.addFields({
        name: `${(nextPage - 1) * usersPerPage + index + 1}. \`${
          user.username
        }\` •💰${user.balance.total.toLocaleString()}`,
        value: " ",
        inline: false,
      });
    });

    // Crear botones para la navegación
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous_page")
        .setLabel("Anterior")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(nextPage <= 1),
      new ButtonBuilder()
        .setCustomId("next_page")
        .setLabel("Siguiente")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(nextPage >= totalPages)
    );

    // Actualizar el mensaje original con la nueva página
    await interaction.editReply({ embeds: [newEmbed], components: [row] });
  },
});

// funcion de numero aleatorio

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
