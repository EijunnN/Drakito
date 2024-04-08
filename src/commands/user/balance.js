// ./src/commands/user/balance.js
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { User } = require("../../../lib/models/schema"); // Ajusta la ruta según tu estructura de proyecto
const { ChatCommand } = require("../../utils/commands");
const { economyChannelIds} = require("../../utils/allowedChannels");
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
    // Obtener el usuario de Discord objetivo
    const targetUser =
      interaction.options.getUser("usuario") ?? interaction.user;

      const channelId = interaction.channel.id;
      if (!economyChannelIds.includes(channelId)) {
        return interaction.reply({
          content: "Este comando solo puede ser utilizado en canales permitidos.",
          ephemeral: true,
        });
      }

    // Buscar el perfil del usuario en la base de datos o crear uno nuevo si no existe
    let userProfile = await User.findOne({ username: targetUser.username });
    if (!userProfile) {
      userProfile = new User({
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

    // Crear el embed con la información del balance
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

    // Enviar el embed como respuesta
    await interaction.reply({ embeds: [balanceEmbed] });
  },
});
