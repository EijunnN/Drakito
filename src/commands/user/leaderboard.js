
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { User, Config } = require("../../../lib/models/schema");
const { ChatCommand } = require("../../utils/commands");

module.exports = ChatCommand({
  name: "leaderboard",
  description: "Muestra el ranking de usuarios por balance total",
  async execute(client, interaction) {
    const page = 1;
    const usersPerPage = 10;

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    const users = await User.find({ guildId: interaction.guild.id })
      .sort({ "balance.total": -1 })
      .limit(usersPerPage);

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

    const leaderboardEmbed = new EmbedBuilder()
      .setTitle(`${interaction.guild.name} - Leaderboard`)
      .setColor("Random")
      .setFooter({ text: `Página ${page} de ${totalPages}` });

    users.forEach((user, index) => {
      leaderboardEmbed.addFields({
        name: `${index + 1}. ${
          user.username
        } •💰${user.balance.total.toLocaleString()}`,
        value: " ",
        inline: false,
      });
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous_page")
        .setLabel("Anterior")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next_page")
        .setLabel("Siguiente")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(totalPages === 1)
    );

    await interaction.reply({ embeds: [leaderboardEmbed], components: [row] });
  },
});
