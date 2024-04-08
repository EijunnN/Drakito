// ./src/commands/user/autoremove.js
const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User } = require("../../../lib/models/schema");
const { rolePermission } = require("../../utils/allowedChannels");
module.exports = ChatCommand({
  name: "auto-remove",
  description:
    "Remueve automáticamente dinero del banco de todos los usuarios.",
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description: "Rol al que remover dinero del banco",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "cantidad",
      description: "Cantidad de dinero a remover",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "tiempoenminutos",
      description: "Intervalo de tiempo en minutos para remover el dinero",
      required: true,
    },
  ],
  async execute(client, interaction) {
    const role = interaction.options.getRole("role");
    const cantidad = interaction.options.getInteger("cantidad");
    const tiempoEnMinutos = interaction.options.getInteger("tiempoenminutos");
    const channelId = interaction.channelId;

    if (!rolePermission.includes(interaction.member.roles.highest.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true,
      });
    }

    setInterval(async () => {
      const roleMembers = await interaction.guild.members.fetch();
      const roleMemberIds = roleMembers
        .filter((member) => member.roles.cache.has(role.id))
        .map((member) => member.id);

      await User.updateMany(
        { discordId: { $in: roleMemberIds } },
        { $inc: { "balance.bank": -cantidad, "balance.total": -cantidad } }
      );

      const channel = client.channels.cache.get(channelId);
      if (channel) {
        channel.send(
          `Se removió automáticamente $${cantidad} del banco de los usuarios con el rol ${role.name}.`
        );
      }
      // Aquí podrías enviar un mensaje al canal o realizar alguna otra acción después de completar la tarea
    }, tiempoEnMinutos * 60000); // Convertir minutos a milisegundos

    return interaction.reply({
      content: `Se programó la remoción automática de $${cantidad} del banco de los usuarios con el rol ${role.name} después de ${tiempoEnMinutos} minutos.`,
      ephemeral: true,
    });
  },
});
