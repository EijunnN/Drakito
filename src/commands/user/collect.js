// ./src/commands/user/collect.js
const { ChatCommand } = require("../../utils/commands");
const { User, Role } = require("../../../lib/models/schema");
const { EmbedBuilder } = require("discord.js"); // Importar MessageEmbed
const { economyChannelIds } = require("../../utils/allowedChannels");
module.exports = ChatCommand({
  name: "collect",
  description: "Recolecta tus ingresos basados en tus roles",
  options: [],
  async execute(client, interaction) {
    const discordId = interaction.user.id;
    const now = new Date();

    // Buscar el perfil del usuario
    const user = await User.findOne({ discordId: discordId });

    const channelId = interaction.channel.id;
    if (!economyChannelIds.includes(channelId)) {
      return interaction.reply({
        content: "Este comando solo puede ser utilizado en canales permitidos.",
        ephemeral: true,
      });
    }
    if (!user) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000") // Rojo para error
            .setTitle("Error")
            .setDescription("No se encontró tu perfil de usuario."),
        ],
        ephemeral: true,
      });
    }

    const member = await interaction.guild.members.fetch(discordId);
    const discordRoles = member.roles.cache.map((role) => role.id);

    let totalCollected = 0;
    let responseText = "";
    let nextCollectionInMinutes = Infinity;
    let roleCounter = "";
    let recolectadoAlgo = false;

    for (const discordRoleId of discordRoles) {
      const roleConfig = await Role.findOne({ discordRoleId: discordRoleId });

      if (roleConfig) {
        const lastCollectTime = user.lastCollect || new Date(0);
        const collectInterval = roleConfig.collectInterval * 60000; // Convertir minutos a milisegundos

        if (now - lastCollectTime >= collectInterval) {
          user.balance.bank += roleConfig.collectAmount;
          user.balance.total += roleConfig.collectAmount;
          totalCollected += roleConfig.collectAmount;
          roleCounter++;
          responseText += `\`${roleCounter}\` - <@&${roleConfig.discordRoleId}> | 💰${roleConfig.collectAmount}\n`;
          recolectadoAlgo = true;
        } else {
          const timeToNextCollection =
            collectInterval - (now - lastCollectTime);
          if (timeToNextCollection < nextCollectionInMinutes) {
            nextCollectionInMinutes = timeToNextCollection;
          }
        }
      }
    }

    if (recolectadoAlgo) {
      user.lastCollect = now;
      await user.save();
    }

    if (totalCollected === 0) {
      let content =
        "No hay ingresos disponibles para recolectar en este momento.";
      if (nextCollectionInMinutes < Infinity) {
        const minutesToNextCollection = Math.ceil(
          nextCollectionInMinutes / 60000
        );
        content += ` La próxima recolección estará disponible en ${minutesToNextCollection} minutos.`;
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FFFF00") // Amarillo para notificación
            .setTitle("Recolección de Ingresos")
            .setDescription(content),
        ],
        ephemeral: false,
      });
    }

    // Enviar respuesta con total recolectado
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#00FF00") // Verde para éxito
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(
            `✅ Role income successfully collected!\n${responseText}`
          ),
      ],
    });
  },
});
