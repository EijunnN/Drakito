// ./src/commands/user/crime.js
const { EmbedBuilder } = require("discord.js");
const { User } = require("../../../lib/models/schema"); // Ajusta la ruta según tu estructura de proyecto
const { ChatCommand } = require("../../utils/commands");
const { economyChannelIds } = require("../../utils/allowedChannels");
// Mapa para realizar un seguimiento del último momento en que cada usuario ejecutó el comando
const cooldowns = new Map();

module.exports = ChatCommand({
  name: "crime",
  description: "Intenta cometer un crimen para obtener efectivo (con riesgo de ser capturado)",
  async execute(client, interaction) {
    // Obtener el usuario de Discord que ejecuta el comando
    const user = interaction.user;

    const channelId = interaction.channel.id;
    if (!economyChannelIds.includes(channelId)) {
      return interaction.reply({
        content: "Este comando solo puede ser utilizado en canales permitidos.",
        ephemeral: true,
      });
    }
    // Verificar si el usuario está en cooldown
    if (cooldowns.has(user.id)) {
      const previousTime = cooldowns.get(user.id);
      const now = Date.now();
      const remainingTime = 1200000 - (now - previousTime); // 20 minutos en milisegundos
      if (remainingTime > 0) {
        return interaction.reply({
          content: `Debes esperar ${Math.ceil(remainingTime / 60000)} minutos antes de poder cometer otro crimen.`,
          ephemeral: false, // Responder solo al usuario que ejecuta el comando
        });
      }
    }

    // Buscar el perfil del usuario en la base de datos o crear uno nuevo si no existe
    let userProfile = await User.findOne({ discordId: user.id });
    if (!userProfile) {
      userProfile = new User({
        discordId: user.id,
        username: user.username,
        balance: {
          cash: 0,
          bank: 0,
          total: 0,
        },
      });
      await userProfile.save();
    }

    // Validar si el usuario tiene suficiente efectivo en el banco para cometer el crimen
    if (userProfile.balance.bank < 2000) {
      return interaction.reply({
        content: "¡No tienes suficiente efectivo en el banco para cometer un crimen!",
        ephemeral: false, // Responder solo al usuario que ejecuta el comando
      });
    }

    // Simular la posibilidad de ser capturado
    const captureChance = Math.random(); // Genera un número aleatorio entre 0 y 1
    let isCaught = captureChance < 0.3; // Por ejemplo, el 30% de posibilidades de ser capturado

    // Determinar la cantidad de efectivo obtenida (o perdida si es capturado)
    let cashEarned = 0;
    if (!isCaught) {
      // Si no es capturado, genera una cantidad aleatoria de efectivo ganado
      cashEarned = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // Entre 2000 y 5000 monedas
      userProfile.balance.cash += cashEarned;
      await userProfile.save();
    } else {
      // Si es capturado, pierde una cantidad fija de su efectivo entre 2000 y 5000
      const lossAmount = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // Entre 2000 y 5000 monedas
      userProfile.balance.bank -= lossAmount;
      await userProfile.save();
      cashEarned -= lossAmount;
    }

    // Actualizar el total de efectivo del usuario en la base de datos
    userProfile.balance.total = userProfile.balance.cash + userProfile.balance.bank;
    await userProfile.save();

    // Actualizar el cooldown del usuario
    cooldowns.set(user.id, Date.now());

    // Formatear el precio en dólares estadounidenses
    const formattedCashEarned = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(cashEarned));

    // Crear el embed con los resultados del intento de crimen
    const crimeEmbed = new EmbedBuilder()
      .setColor(isCaught ? "Red" : "Green")
      .setDescription(
        isCaught
          ? `❌¡Oops! ${user.username} fue atrapado intentando cometer un crimen y perdió ${formattedCashEarned}.`
          : `🎈¡Felicidades! ${user.username} ha cometido un crimen exitosamente y ha ganado ${formattedCashEarned}.`
      );

    // Enviar el embed como respuesta
    await interaction.reply({ embeds: [crimeEmbed] });
  },
});
