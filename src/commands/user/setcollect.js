const { ApplicationCommandOptionType } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { Role, Config } = require("../../../lib/models/schema");

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
    const guildId = interaction.guild.id;
    const adminRoles = await Config.findOne({ guildId, key: "adminRoles" });

    if (
      !adminRoles ||
      !adminRoles.value.some((roleId) =>
        interaction.member.roles.cache.has(roleId)
      )
    ) {
      return interaction.reply({
        content: "No tienes permisos para utilizar este comando.",
        ephemeral: true,
      });
    }

    if (!role.id) {
      return interaction.reply({
        content: "El rol seleccionado no tiene un ID de Discord válido.",
        ephemeral: true,
      });
    }

    try {
      await Role.findOneAndUpdate(
        { discordRoleId: role.id, guildId: interaction.guild.id },
        { collectAmount: amount, collectInterval: interval },
        { upsert: true, new: true }
      );

      return interaction.reply({
        content: `El rol <@&${role.id}> ahora recolecta $${amount} cada ${interval} minutos.`,
        ephemeral: false,
      });
    } catch (error) {
      if (error.code === 11000) {
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
