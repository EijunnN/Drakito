// ./src/commands/user/setcollect.js
const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { Role } = require("../../../lib/models/schema");
const { rolePermission } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "setcollect",
  description: "Configura la recolección de ingresos para un rol",
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description: "El rol para configurar",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "cantidad",
      description: "La cantidad de dinero a recolectar",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "tiempo",
      description: "Tiempo en minutos entre recolecciones",
      required: true,
    },
  ],
  async execute(client, interaction) {
    const role = interaction.options.getRole("role");
    const amount = interaction.options.getInteger("cantidad");
    const interval = interaction.options.getInteger("tiempo");
    
    if (!rolePermission.includes(interaction.member.roles.highest.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true,
      });
    }
    // Verificar que el discordRoleId no sea nulo
    if (!role.id) {
      return interaction.reply({
        content: "El rol seleccionado no tiene un ID de Discord válido.",
        ephemeral: true,
      });
    }

    try {
      await Role.findOneAndUpdate(
        { discordRoleId: role.id },
        { collectAmount: amount, collectInterval: interval },
        { upsert: true, new: true }
      );

      return interaction.reply({
        content: `El rol <@&${role.id}> ahora recolecta $${amount} cada ${interval} minutos.`,
        ephemeral: false,
      });
      // Resto del código de respuesta...
    } catch (error) {
      if (error.code === 11000) {
        // Manejar el error de índice duplicado
        return interaction.reply({
          content: "Ya existe un rol con el mismo ID de Discord.",
          ephemeral: true,
        });
      } else {
        // Manejar otros errores
        console.error("Error al configurar el collect:", error);
        return interaction.reply({
          content: "Hubo un error al tratar de actualizar la configuración.",
          ephemeral: true,
        });
      }
    }
  },
});
