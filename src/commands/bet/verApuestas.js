// verApuestas.js
// const { ChatCommand } = require("../../utils/commands");
// const { Bet } = require("../../../lib/models/schema");
// const { ApplicationCommandOptionType } = require("discord.js");
// const { economyChannelIds } = require("../../utils/allowedChannels");

// module.exports = ChatCommand({
//   name: "ver-apuestas",
//   description: "Muestra las apuestas disponibles para los usuarios",
//   options: [
//     {
//       name: "estado",
//       description: "Estado de las apuestas a mostrar",
//       type: ApplicationCommandOptionType.String,
//       required: true,
//       choices: [
//         { name: "Abiertas", value: "open" },
//         { name: "Cerradas", value: "closed" },
//         { name: "Todas", value: "all" },
//       ],
//     },
//   ],
//   async execute(client, interaction) {
//     await interaction.deferReply();
//     const channelId = interaction.channel.id;
//     if (!economyChannelIds.includes(channelId)) {
//       return interaction.reply({
//         content: "Este comando solo puede ser utilizado en canales permitidos.",
//         ephemeral: true,
//       });
//     }
//     try {
//       let query = {};
//       const estado = interaction.options.getString("estado");
//       if (estado === "open") {
//         query = { status: "open" };
//       } else if (estado === "closed") {
//         query = { status: "closed" };
//       }

//       const bets = await Bet.find(query);

//       if (bets.length === 0) {
//         return interaction.editReply({
//           content: "No hay apuestas disponibles en este momento.",
//           ephemeral: true,
//         });
//       }

//       // Separar las apuestas en partes para respetar el límite de caracteres
//       const parts = [];
//       let currentPart = "";
//       for (const bet of bets) {
//         const betText =
//           `**Nº ${bets.indexOf(bet) + 1}**\n` +
//           `**${bet.liga}** - ${bet.region}\n` +
//           `**Evento:** ${bet.description}\n` +
//           `**ID de la apuesta:** ${bet.betId}\n` +
//           `**Estado:** ${bet.status === "open" ? "Abierta" : "Cerrada"}\n` +
//           `**Opciones:**\n` +
//           bet.bets
//             .map(
//               (b, index) =>
//                 `**${index + 1}**-${b.description} - Cuota: ${b.cuota}`
//             )
//             .join("\n") +
//           "\n----------------\n";

//         if (currentPart.length + betText.length > 2000) {
//           // Si la parte actual excede el límite, guardarla y comenzar una nueva parte
//           parts.push(currentPart);
//           currentPart = betText;
//         } else {
//           // Si la parte actual no excede el límite, agregar el texto a la parte actual
//           currentPart += betText;
//         }
//       }
//       // Agregar la última parte
//       parts.push(currentPart);

//       // Enviar cada parte como un mensaje separado
//       for (const part of parts) {
//         await interaction.followUp({
//           content: part,
//           ephemeral: true,
//         });
//       }
//     } catch (error) {
//       console.error("Error al obtener las apuestas:", error);
//       return interaction.reply({
//         content: "Ocurrió un error al obtener las apuestas.",
//         ephemeral: true,
//       });
//     }
//   },
// });


// const { ChatCommand } = require("../../utils/commands");
// const { Bet } = require("../../../lib/models/schema");
// const { createCanvas, loadImage } = require('canvas');
// const path = require('path');

// module.exports = ChatCommand({
//   name: "ver-apuestas",
//   description: "Muestra las apuestas disponibles para los usuarios",
//   async execute(client, interaction) {
//     await interaction.deferReply();
//     try {
//       const bets = await Bet.find({});
//       if (bets.length === 0) {
//         return interaction.reply({
//           content: "No hay apuestas disponibles en este momento.",
//           ephemeral: true,
//         });
//       }

//       for (const bet of bets) {
//         const canvas = createCanvas(800, 600);
//         const context = canvas.getContext('2d');

//         // Cargar una imagen de fondo desde la carpeta pública
//         const background = await loadImage(path.join(__dirname, '../../../types/xdq23.jpg'));
//         context.drawImage(background, 0, 0, canvas.width, canvas.height);

//         // Dibujar el título de la apuesta
//         context.font = 'bold 36px Arial';
//         context.fillStyle = '#ffffff';
//         context.fillText(`${bet.liga} - ${bet.region}`, 20, 60);

//         // Dibujar la descripción de la apuesta
//         context.font = '24px Arial';
//         context.fillText(`Evento: ${bet.description}`, 20, 100);

//         // Dibujar un rectángulo para las opciones de apuesta
//         context.fillStyle = 'rgba(255, 255, 255, 0.8)';
//         context.fillRect(20, 140, 760, bet.bets.length * 50 + 40);

//         // Dibujar las opciones de apuesta
//         context.fillStyle = '#000000';
//         let y = 180;
//         bet.bets.forEach((b, index) => {
//           context.font = 'bold 20px Arial';
//           context.fillText(`${index + 1}`, 40, y);
//           context.font = '18px Arial';
//           context.fillText(`${b.description} - Cuota: ${b.cuota}`, 80, y);
//           y += 40;
//         });

//         // Guardar la imagen en un búfer
//         const buffer = canvas.toBuffer('image/png');
//         await interaction.followUp({ files: [{ attachment: buffer, name: `apuesta-${bet.betId}.png` }], ephemeral: true });
//       }
//     } catch (error) {
//       console.error("Error al obtener las apuestas:", error);
//       return interaction.reply({
//         content: "Ocurrió un error al obtener las apuestas.",
//         ephemeral: true,
//       });
//     }
//   },
// });


// verApuestas.js
const { ChatCommand } = require("../../utils/commands");
const { Bet, Config } = require("../../../lib/models/schema");
const { ApplicationCommandOptionType } = require("discord.js");


module.exports = ChatCommand({
  name: "ver-apuestas",
  description: "Muestra las apuestas disponibles para los usuarios",
  options: [
    {
      name: "estado",
      description: "Estado de las apuestas a mostrar",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Abiertas", value: "open" },
        { name: "Cerradas", value: "closed" },
        { name: "Todas", value: "all" },
      ],
    },
  ],
  async execute(client, interaction) {
    
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
    await interaction.deferReply();
    try {
      const currentDate = new Date();
      const searchDate = new Date(currentDate);
      searchDate.setDate(searchDate.getDate() + 1);

      let query = {
        guildId: interaction.guild.id,
        date: {
          $gte: new Date(searchDate.toISOString().slice(0, 10)),
          $lt: new Date(searchDate.toISOString().slice(0, 10) + "T23:59:59.999Z"),
        },
      };

      const estado = interaction.options.getString("estado");
      if (estado === "open") {
        query.status = "open";
      } else if (estado === "closed") {
        query.status = "closed";
      }

      const bets = await Bet.find(query);

      if (bets.length === 0) {
        return interaction.editReply({
          content: "No hay apuestas disponibles en este momento.",
          ephemeral: true,
        });
      }

      // Separar las apuestas en partes para respetar el límite de caracteres
      const parts = [];
      let currentPart = "";
      for (const bet of bets) {
        const betText =
          `**Nº ${bets.indexOf(bet) + 1}**\n` +
          `**${bet.liga}** - ${bet.region}\n` +
          `**Evento:** ${bet.description}\n` +
          `**ID de la apuesta:** ${bet.betId}\n` +
          `**Estado:** ${bet.status === "open" ? "Abierta" : "Cerrada"}\n` +
          `**Opciones:**\n` +
          bet.bets
            .map(
              (b, index) =>
                `**${index + 1}**-${b.description} - Cuota: ${b.cuota}`
            )
            .join("\n") +
          "\n----------------\n";

        if (currentPart.length + betText.length > 2000) {
          // Si la parte actual excede el límite, guardarla y comenzar una nueva parte
          parts.push(currentPart);
          currentPart = betText;
        } else {
          // Si la parte actual no excede el límite, agregar el texto a la parte actual
          currentPart += betText;
        }
      }
      // Agregar la última parte
      parts.push(currentPart);

      // Enviar cada parte como un mensaje separado
      for (const part of parts) {
        await interaction.followUp({
          content: part,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error al obtener las apuestas:", error);
      return interaction.reply({
        content: "Ocurrió un error al obtener las apuestas.",
        ephemeral: true,
      });
    }
  },
});