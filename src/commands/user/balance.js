
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { User, Config } = require("../../../lib/models/schema"); // Ajusta la ruta según tu estructura de proyecto
const { ChatCommand } = require("../../utils/commands");

module.exports = ChatCommand({
  name: "balance",
  description: "Muestra tu balance de efectivo y banco",
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "usuario",
      description: "Selecciona un usuario para ver su balance",
      required: false,
    },
  ],
  async execute(client, interaction) {
    
    const targetUser =
      interaction.options.getUser("usuario") ?? interaction.user;

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

    
    let userProfile = await User.findOne({ discordId: targetUser.id, guildId: interaction.guild.id });

    if (!userProfile) {
      userProfile = new User({
        guildId: interaction.guild.id,
        discordId: targetUser.id,
        username: targetUser.username,
        balance: {
          cash: 0,
          bank: 0,
          total: 0,
        },
      });
      await userProfile.save();
    }

    
    const balanceEmbed = new EmbedBuilder()
      .setAuthor({
        name: targetUser.tag,
        iconURL: targetUser.displayAvatarURL(),
      })

      .setColor("Random")
      .addFields(
        {
          name: "Cash",
          value: `💵 ${userProfile.balance.cash.toLocaleString()}`,
          inline: true,
        },

        {
          name: "Bank",
          value: `🏦 ${userProfile.balance.bank.toLocaleString()}`,
          inline: false,
        },

        {
          name: "Total",
          value: `💰 ${userProfile.balance.total.toLocaleString()}`,
          inline: true,
        }
      )
      .setTimestamp();

    
    await interaction.reply({ embeds: [balanceEmbed] });
  },
});
