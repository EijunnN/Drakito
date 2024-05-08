const { Button } = require("../../utils/components");
const { User } = require("../../../lib/models/schema");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = Button({
  customId: "previous_page",
  async execute(client, interaction) {
    // Extraer la página actual del embed
    const embed = interaction.message.embeds[0];
    const footerText = embed.footer.text;
    const currentPage = parseInt(footerText.match(/Página (\d+) de (\d+)/)[1]);
    const totalPages = parseInt(footerText.match(/Página (\d+) de (\d+)/)[2]);
    const previousPage = Math.max(1, currentPage - 1);

    // Comprobar si ya estamos en la primera página
    if (currentPage === 1) {
      return interaction.reply({
        content: "Ya estás en la primera página.",
        ephemeral: true,
      });
    }

    // Configuración de la paginación
    const usersPerPage = 10;

    // Obtener los usuarios para la página anterior
    const users = await User.find({ guildId: interaction.guild.id })
      .sort({ "balance.total": -1 })
      .skip((previousPage - 1) * usersPerPage)
      .limit(usersPerPage);

    // Crear un nuevo embed para la página anterior
    const newEmbed = new EmbedBuilder()
      .setTitle(`${interaction.guild.name} - Leaderboard`)
      .setColor("Random")
      .setFooter({ text: `Página ${previousPage} de ${totalPages}` });

    users.forEach((user, index) => {
      newEmbed.addFields({
        name: `${(previousPage - 1) * usersPerPage + index + 1}. \`${
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
        .setDisabled(previousPage <= 1),
      new ButtonBuilder()
        .setCustomId("next_page")
        .setLabel("Siguiente")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(previousPage >= totalPages)
    );

    // Actualizar el mensaje original con la nueva página
    await interaction.editReply({ embeds: [newEmbed], components: [row] });
  },
});
