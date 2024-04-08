// ./src/commands/user/removemoney.js
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User } = require("../../../lib/models/schema");
const { rolePermission } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "remove-money",
  description:
    "Remueve dinero del cash o banco de un usuario o de todos los usuarios con un rol específico",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "tipo",
      description: "Tipo de balance a disminuir (cash/bank)",
      required: true,
      choices: [
        { name: "cash", value: "cash" },
        { name: "bank", value: "bank" },
      ],
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "cantidad",
      description: "Cantidad de dinero a remover",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: "usuario",
      description: "Usuario al que remover dinero",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description:
        "Rol al que remover dinero del banco (todos los usuarios con este rol)",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "razon",
      description: "Razón para remover dinero",
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
      const user = await User.findOne({ discordId: targetUser.id });

      if (!user) {
        // Si el usuario no existe, se crea un nuevo registro con balance negativo
        const newUser = new User({
          discordId: targetUser.id,
          username: targetUser.username,
          balance: {
            cash: tipo === "cash" ? -cantidad : 0,
            bank: tipo === "bank" ? -cantidad : 0,
            total: -cantidad,
          },
        });
        await newUser.save();
      } else {
        // Si el usuario ya existe, actualizamos su balance incluso si resulta negativo
        user.balance[tipo] -= cantidad;
        user.balance.total = user.balance.cash + user.balance.bank;
        await user.save();
      }

      return interaction.reply({
        content: `Se removió $${cantidad} del ${tipo} de ${targetUser.username} por la razón: ${razon}.`,
      });
    } else if (role) {
      const roleMembers = await interaction.guild.members.fetch();
      const roleMemberIds = roleMembers
        .filter((member) => member.roles.cache.has(role.id))
        .map((member) => member.id);

      // Aquí se actualiza el balance de todos los usuarios con el rol, permitiendo balances negativos
      await User.updateMany(
        { discordId: { $in: roleMemberIds } },
        { $inc: { [`balance.${tipo}`]: -cantidad, "balance.total": -cantidad } }
      );

      return interaction.reply({
        content: `Se removió $${cantidad} del ${tipo} de todos los usuarios con el rol ${role.name} por la razón: ${razon}.`,
      });
    }
  },
});
