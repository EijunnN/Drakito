// ./src/commands/user/addmoney.js
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User } = require("../../../lib/models/schema");
const { economyChannelIds, rolePermission } = require("../../utils/allowedChannels");	

module.exports = ChatCommand({
  name: "add-money",
  description:
    "Añade dinero al cash o banco de un usuario o a todos los usuarios con un rol específico",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "tipo",
      description: "Tipo de balance a aumentar (cash/bank)",
      required: true,
      choices: [
        { name: "cash", value: "cash" },
        { name: "bank", value: "bank" },
      ],
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "cantidad",
      description: "Cantidad de dinero a añadir",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: "usuario",
      description: "Usuario al que añadir dinero",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description:
        "Rol al que añadir dinero en el banco (todos los usuarios con este rol)",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "razon",
      description: "Razón para añadir dinero",
      required: false,
    },
  ],
  async execute(client, interaction) {
    const targetUser = interaction.options.getUser("usuario");
    const role = interaction.options.getRole("role");
    const tipo = interaction.options.getString("tipo");
    const cantidad = interaction.options.getInteger("cantidad");
    const razon = interaction.options.getString("razon") || "No especificada";

    if (!rolePermission.includes(interaction.member.roles.highest.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true,
      });
    }
    
    if (targetUser && role) {
      return interaction.reply({
        content: "Especifica un usuario o un rol, no ambos.",
        ephemeral: true,
      });
    }

    if (!targetUser && !role) {
      return interaction.reply({
        content: "Debes especificar un usuario o un rol.",
        ephemeral: true,
      });
    }

    if (cantidad <= 0) {
      return interaction.reply({
        content: "La cantidad debe ser mayor que cero.",
        ephemeral: true,
      });
    }

    if (targetUser) {
      let user = await User.findOne({ discordId: targetUser.id });

      if (!user) {
        user = new User({
          discordId: targetUser.id,
          username: targetUser.username,
          balance: {
            cash: tipo === "cash" ? cantidad : 0,
            bank: tipo === "bank" ? cantidad : 0,
            total: cantidad,
          },
          // Inicializar otros campos según sea necesario
        });
      } else {
        user.balance[tipo] += cantidad;
        user.balance.total = user.balance.cash + user.balance.bank;
      }

      await user.save();

      return interaction.reply({
        content: `Se añadió $${cantidad}💸 al ${tipo} de ${targetUser.username} por la razón: ${razon}.`,
      });
    } else if (role) {
      const roleMembers = await interaction.guild.members.fetch();
      const roleMemberIds = roleMembers
        .filter((member) => member.roles.cache.has(role.id))
        .map((member) => member.id);

      for (const memberId of roleMemberIds) {
        let user = await User.findOne({ discordId: memberId });

        if (!user) {
          user = new User({
            discordId: memberId,
            username: roleMembers.get(memberId).user.username,
            balance: {
              cash: tipo === "cash" ? cantidad : 0,
              bank: tipo === "bank" ? cantidad : 0,
              total: cantidad,
            },
          });
        } else {
          user.balance[tipo] += cantidad;
          user.balance.total = user.balance.cash + user.balance.bank;
        }

        await user.save();
      }

      return interaction.reply({
        content: `Se añadió $${cantidad} al ${tipo} de todos los usuarios con el rol ${role.name} por la razón: ${razon}.`,
      });
    }
  },
});
