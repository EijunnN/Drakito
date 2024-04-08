// ./src/commands/user/work.js
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User } = require("../../../lib/models/schema");
const { allowedChannels, economyChannelIds } = require("../../utils/allowedChannels");


// Definir los diferentes trabajos y sus tareas asociadas
const jobs = {
  rappi: {
    title: "🛵 Repartidor de Rappi",
    tasks: [
      {
        description:
          "Entregaste un pedido de comida a @user y recibiste una propina generosa",
        earnings: 1000,
      },
      {
        description:
          "Realizaste una entrega de última hora a @user y ganaste un bono",
        earnings: 1500,
      },
      {
        description:
          "Entregaste un paquete a @user y recibiste una calificación perfecta",
        earnings: 1200,
      },
      {
        description:
          "Realizaste una entrega rápida para @user y recibiste una propina extra",
        earnings: 1300,
      },
      {
        description:
          "Ayudaste a @user a recibir su pedido a tiempo y ganaste una recompensa adicional",
        earnings: 1400,
      },
      {
        description:
          "Realizaste una entrega especializada para @user y recibiste una bonificación",
        earnings: 1600,
      },
      {
        description:
          "Entregaste múltiples pedidos para @user y recibiste una propina generosa",
        earnings: 1700,
      },
      {
        description:
          "Entregaste un pedido con precisión y recibiste una calificación excepcional",
        earnings: 1800,
      },
      {
        description:
          "Ayudaste a @user a resolver un problema de pedido y ganaste una recompensa",
        earnings: 1900,
      },
      {
        description:
          "Entregaste un pedido en una zona de difícil acceso y recibiste una bonificación adicional",
        earnings: 2000,
      },
      {
        description:
          "Entregaste un pedido para @user y recibiste una propina por tu excelente servicio",
        earnings: 2100,
      },
      {
        description:
          "Realizaste múltiples entregas para @user y recibiste una bonificación especial",
        earnings: 2200,
      },
      {
        description:
          "Entregaste un pedido delicado con cuidado y recibiste una calificación perfecta",
        earnings: 2300,
      },
      {
        description:
          "Ayudaste a @user a recibir su pedido a pesar de los problemas de tráfico y ganaste una recompensa adicional",
        earnings: 2400,
      },
      {
        description:
          "Realizaste una entrega nocturna para @user y recibiste una propina generosa",
        earnings: 2500,
      },
    ],
  },
  uber: {
    title: "🚗 Conductor de Uber",
    tasks: [
      {
        description:
          "Llevaste a @user a su destino de manera rápida y eficiente",
        earnings: 1200,
      },
      {
        description:
          "Ayudaste a @user a llegar a tiempo a una reunión importante",
        earnings: 1800,
      },
      {
        description:
          "Realizaste un viaje largo para @user y recibiste una propina generosa",
        earnings: 1500,
      },
      {
        description:
          "Llevaste a @user a múltiples destinos y ganaste un bono por tu excelente servicio",
        earnings: 1600,
      },
      {
        description:
          "Ayudaste a @user a encontrar un artículo perdido en tu vehículo y ganaste una recompensa",
        earnings: 1700,
      },
      {
        description:
          "Realizaste múltiples viajes para @user y recibiste una bonificación especial",
        earnings: 2200,
      },
      {
        description:
          "Llevaste a @user a su destino con seguridad a pesar del mal tiempo y recibiste una propina adicional",
        earnings: 2300,
      },
      {
        description:
          "Realizaste un viaje a un área de difícil acceso para @user y recibiste una recompensa",
        earnings: 2400,
      },
      {
        description:
          "Llevaste a @user en un viaje corto y recibiste una propina inesperada",
        earnings: 2500,
      },
      {
        description:
          "Ayudaste a @user a cargar sus pertenencias en el vehículo y ganaste una recompensa adicional",
        earnings: 2600,
      },
      {
        description:
          "Realizaste un viaje de última hora para @user y recibiste una bonificación especial",
        earnings: 2700,
      },
      {
        description:
          "Llevaste a @user a un destino alejado con rapidez y recibiste una propina generosa",
        earnings: 2800,
      },
      {
        description:
          "Ayudaste a @user a resolver un problema de ruta y ganaste una recompensa",
        earnings: 2900,
      },
      {
        description:
          "Realizaste un viaje nocturno para @user y recibiste una bonificación adicional",
        earnings: 3000,
      },
    ],
  },
  amazon: {
    title: "📦 Repartidor de Amazon",
    tasks: [
      {
        description:
          "Entregaste un paquete urgente a @user y recibiste una excelente calificación",
        earnings: 1500,
      },
      {
        description:
          "Manejaste una entrega delicada para @user con gran cuidado",
        earnings: 2000,
      },
      {
        description:
          "Entregaste múltiples paquetes para @user y recibiste una bonificación",
        earnings: 1700,
      },
      {
        description:
          "Resolviste un problema de entrega y recibiste una recompensa por tu ayuda",
        earnings: 1600,
      },
      {
        description:
          "Entregaste un paquete a un área difícil de alcanzar para @user y ganaste una recompensa adicional",
        earnings: 1400,
      },
      {
        description:
          "Manejaste una situación de entrega complicada para @user y recibiste una bonificación especial",
        earnings: 1800,
      },
      {
        description:
          "Entregaste un paquete pesado para @user y recibiste una propina inesperada",
        earnings: 1900,
      },
      {
        description:
          "Resolviste un problema de entrega en el último minuto y recibiste una bonificación adicional",
        earnings: 2200,
      },
      {
        description:
          "Entregaste un paquete a pesar de las condiciones climáticas adversas y recibiste una recompensa",
        earnings: 2300,
      },
      {
        description:
          "Manejaste una situación de entrega urgente para @user y ganaste una recompensa especial",
        earnings: 2400,
      },
      {
        description:
          "Entregaste un paquete a un cliente impaciente y recibiste una propina generosa",
        earnings: 2500,
      },
      {
        description:
          "Manejaste una situación de entrega de último minuto para @user y ganaste una bonificación especial",
        earnings: 2600,
      },
      {
        description:
          "Entregaste un paquete a un área remota para @user y recibiste una propina inesperada",
        earnings: 2700,
      },
      {
        description:
          "Manejaste una entrega difícil para @user y recibiste una bonificación adicional",
        earnings: 2800,
      },
    ],
  },
  police: {
    title: "👮 Oficial de Policía",
    tasks: [
      {
        description:
          "Arrestaste a un criminal peligroso y recibiste una recompensa",
        earnings: 3000,
      },
      {
        description:
          "Resolviste un caso importante y recibiste una bonificación",
        earnings: 3500,
      },
      {
        description:
          "Ayudaste a mantener la seguridad en la comunidad y recibiste una recompensa adicional",
        earnings: 3200,
      },
      {
        description:
          "Arrestaste a un ladrón en el acto y recibiste una propina generosa",
        earnings: 3300,
      },
      {
        description:
          "Resolviste un caso de robo con éxito y recibiste una bonificación especial",
        earnings: 3400,
      },
      {
        description:
          "Ayudaste a resolver un caso de fraude y recibiste una recompensa adicional",
        earnings: 3700,
      },
      {
        description:
          "Arrestaste a un criminal buscado y recibiste una propina inesperada",
        earnings: 3800,
      },
      {
        description:
          "Resolviste un caso de violencia doméstica con éxito y recibiste una bonificación adicional",
        earnings: 3900,
      },
      {
        description:
          "Ayudaste a resolver un caso de secuestro y recibiste una recompensa especial",
        earnings: 4000,
      },
      {
        description:
          "Arrestaste a un delincuente peligroso y recibiste una propina generosa",
        earnings: 4100,
      },
      {
        description:
          "Resolviste un caso de asesinato con éxito y recibiste una bonificación especial",
        earnings: 4200,
      },
      {
        description:
          "Ayudaste a resolver un caso de tráfico de drogas y recibiste una recompensa adicional",
        earnings: 4300,
      },
      {
        description:
          "Arrestaste a un criminal en una persecución y recibiste una propina inesperada",
        earnings: 4400,
      },
      {
        description:
          "Resolviste un caso de corrupción con éxito y recibiste una bonificación adicional",
        earnings: 4500,
      },
    ],
  },
};

const cooldownTime = 10 * 60 * 1000; // 10 minutos en milisegundos
const cooldowns = new Map();

module.exports = ChatCommand({
  name: "work",
  description: "Realiza un trabajo y gana dinero",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "job",
      description: "El trabajo que deseas realizar",
      required: true,
      choices: Object.keys(jobs).map((job) => ({
        name: jobs[job].title,
        value: job,
      })),
    },
  ],
  async execute(client, interaction) {
    const discordId = interaction.user.id;
    const selectedJob = interaction.options.getString("job");
    const job = jobs[selectedJob];
    // const channelId = interaction.channelId;

    const channelId = interaction.channel.id;
    if (!economyChannelIds.includes(channelId)) {
      return interaction.reply({
        content: "Este comando solo puede ser utilizado en canales permitidos.",
        ephemeral: true,
      });
    }

    
    // Buscar el perfil del usuario
    let userProfile = await User.findOne({ discordId: discordId });
    if (!userProfile) {
      userProfile = new User({
        discordId: discordId,
        username: interaction.user.username,
        balance: {
          cash: 0,
          bank: 0,
          total: 0,
        },
      });
      await userProfile.save();
    }
    // Verificar si el usuario está en cooldown
    if (cooldowns.has(discordId)) {
      const lastWorkTime = cooldowns.get(discordId);
      const timeElapsed = Date.now() - lastWorkTime;

      if (timeElapsed < cooldownTime) {
        const timeLeft = (cooldownTime - timeElapsed) / 1000; // Convertir a segundos
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);

        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("⏰ Cooldown")
          .setDescription(
            `${interaction.user}, debes esperar ${minutes} minuto(s) y ${seconds} segundo(s) antes de poder trabajar nuevamente.`
          );

        return interaction.reply({ embeds: [embed], ephemeral: false });
      }
    }
    // Obtener una tarea aleatoria y un usuario aleatorio
    const task = job.tasks[Math.floor(Math.random() * job.tasks.length)];
    const randomUser = interaction.guild.members.cache.random().user;

    // Calcular las ganancias con un elemento de aleatoriedad
    const baseEarnings = task.earnings;
    const bonusPercentage = Math.random();
    const totalEarnings = baseEarnings * (1 + bonusPercentage);

    // Verificar si el trabajo falla (5% de probabilidad)
    const failureChance = Math.random();
    const isFailure = failureChance < 0.05;

    let description;
    if (isFailure) {
      description = `❌ ${interaction.user}, tuviste un mal día en el trabajo. No pudiste completar la tarea y no ganaste dinero.`;
    } else {
      // Actualizar el balance del usuario
      userProfile.balance.cash += totalEarnings;
      userProfile.balance.total =
        userProfile.balance.cash + userProfile.balance.bank;
      await userProfile.save();

      description = `✅ ${interaction.user}, ${task.description.replace(
        "@user",
        `<@${randomUser.id}>`
      )} y ganaste $${totalEarnings.toFixed(2)}.`;
    }

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(job.title)
      .setDescription(description)
      .addFields(
        // { name: "Tarea", value: task.description.replace("@user", `<@${randomUser.id}>`) },
        { name: "Ganancias Base", value: `$${baseEarnings.toFixed(2)}` },
        { name: "Bonus", value: `${(bonusPercentage * 100).toFixed(2)}%` },
        {
          name: "Ganancias Totales",
          value: isFailure ? "$0.00" : `$${totalEarnings.toFixed(2)}`,
        }
      );

    cooldowns.set(discordId, Date.now());
    await interaction.reply({ embeds: [embed] });
  },
});
