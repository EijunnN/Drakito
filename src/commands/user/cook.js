// cook.js
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { User, Config } = require("../../../lib/models/schema");

const dishes = [
  {
    name: "Pizza",
    ingredients: [
      "Masa",
      "Salsa de tomate",
      "Queso",
      "Pepperoni",
      "Champiñones",
    ],
    availableIngredients: [
      "Masa",
      "Salsa de tomate",
      "Queso",
      "Pepperoni",
      "Champiñones",
      "Cebolla",
      "Pimientos",
      "Aceitunas",
      "Jamón",
      "Piña",
    ],
    timeLimit: 15,
  },
  {
    name: "Sushi",
    ingredients: ["Arroz", "Alga nori", "Salmón", "Aguacate", "Pepino"],
    availableIngredients: [
      "Arroz",
      "Alga nori",
      "Salmón",
      "Aguacate",
      "Pepino",
      "Cangrejo",
      "Camarón",
      "Mango",
      "Queso crema",
      "Sésamo",
    ],
    timeLimit: 15,
  },
  {
    name: "Tacos",
    ingredients: ["Tortillas", "Carne molida", "Cebolla", "Cilantro", "Salsa"],
    availableIngredients: [
      "Tortillas",
      "Carne molida",
      "Cebolla",
      "Cilantro",
      "Salsa",
      "Lechuga",
      "Tomate",
      "Queso",
      "Aguacate",
      "Crema",
    ],
    timeLimit: 15,
  },
  {
    name: "Hamburguesa",
    ingredients: ["Pan", "Carne", "Lechuga", "Tomate", "Queso"],
    availableIngredients: [
      "Pan",
      "Carne",
      "Lechuga",
      "Tomate",
      "Queso",
      "Cebolla",
      "Pepinillos",
      "Mayonesa",
      "Mostaza",
      "Ketchup",
    ],
    timeLimit: 15,
  },
  {
    name: "Pastel",
    ingredients: ["Harina", "Azúcar", "Huevos", "Leche", "Vainilla"],
    availableIngredients: [
      "Harina",
      "Azúcar",
      "Huevos",
      "Leche",
      "Vainilla",
      "Mantequilla",
      "Cacao",
      "Fresas",
      "Crema batida",
      "Nueces",
    ],
    timeLimit: 15,
  },
  {
    name: "Enchiladas",
    ingredients: [
      "Tortillas",
      "Pollo deshebrado",
      "Queso",
      "Salsa roja",
      "Crema",
    ],
    availableIngredients: [
      "Tortillas",
      "Pollo deshebrado",
      "Queso",
      "Salsa roja",
      "Crema",
      "Cebolla",
      "Aguacate",
      "Lechuga",
      "Cilantro",
      "Frijoles refritos",
    ],
    timeLimit: 12, // Tiempo límite en minutos
  },
  {
    name: "Pasta Alfredo",
    ingredients: ["Pasta", "Pollo", "Crema", "Ajo", "Queso parmesano"],
    availableIngredients: [
      "Pasta",
      "Pollo",
      "Crema",
      "Ajo",
      "Queso parmesano",
      "Espinacas",
      "Champiñones",
      "Brócoli",
      "Pimienta",
      "Tomate seco",
    ],
    timeLimit: 15,
  },
  {
    name: "Paella",
    ingredients: ["Arroz", "Pollo", "Mariscos", "Pimiento", "Azafrán"],
    availableIngredients: [
      "Arroz",
      "Pollo",
      "Mariscos",
      "Pimiento",
      "Azafrán",
      "Caldo de pollo",
      "Guisantes",
      "Tomate",
      "Limón",
      "Almejas",
    ],
    timeLimit: 25,
  },
  {
    name: "Caesar Salad",
    ingredients: [
      "Lechuga romana",
      "Pollo a la parrilla",
      "Pan tostado",
      "Queso parmesano",
      "Aderezo Caesar",
    ],
    availableIngredients: [
      "Lechuga romana",
      "Pollo a la parrilla",
      "Pan tostado",
      "Queso parmesano",
      "Aderezo Caesar",
      "Tomate cherry",
      "Huevo duro",
      "Aceitunas",
      "Anchoas",
      "Aguacate",
    ],
    timeLimit: 10,
  },
  {
    name: "Risotto de Champiñones",
    ingredients: [
      "Arroz Arborio",
      "Champiñones",
      "Caldo de verduras",
      "Vino blanco",
      "Queso parmesano",
    ],
    availableIngredients: [
      "Arroz Arborio",
      "Champiñones",
      "Caldo de verduras",
      "Vino blanco",
      "Queso parmesano",
      "Cebolla",
      "Ajo",
      "Mantequilla",
      "Aceite de oliva",
      "Perejil",
    ],
    timeLimit: 20,
  },
  {
    name: "Ceviche",
    ingredients: [
      "Pescado blanco",
      "Limón",
      "Cebolla roja",
      "Ají limo",
      "Cilantro",
    ],
    availableIngredients: [
      "Pescado blanco",
      "Limón",
      "Cebolla roja",
      "Ají limo",
      "Cilantro",
      "Camote",
      "Maíz choclo",
      "Leche de tigre",
      "Ajo",
      "Sal",
    ],
    timeLimit: 10, // Tiempo límite en minutos
  },
  {
    name: "Asado",
    ingredients: [
      "Bife de chorizo",
      "Morcilla",
      "Chorizo",
      "Provoleta",
      "Mollejas",
    ],
    availableIngredients: [
      "Bife de chorizo",
      "Morcilla",
      "Chorizo",
      "Provoleta",
      "Mollejas",
      "Papas",
      "Ensalada mixta",
      "Chimichurri",
      "Sal",
      "Aceite",
    ],
    timeLimit: 10,
  },
  {
    name: "Bandeja Paisa",
    ingredients: [
      "Carne molida",
      "Chicharrón",
      "Arroz",
      "Aguacate",
      "Plátano maduro",
    ],
    availableIngredients: [
      "Carne molida",
      "Chicharrón",
      "Arroz",
      "Aguacate",
      "Plátano maduro",
      "Huevo frito",
      "Frijoles",
      "Arepa",
      "Mazorca",
      "Hogao",
    ],
    timeLimit: 10,
  },
  {
    name: "Ajiaco",
    ingredients: ["Pollo", "Papa criolla", "Maíz", "Aguacate", "Cilantro"],
    availableIngredients: [
      "Pollo",
      "Papa criolla",
      "Maíz",
      "Aguacate",
      "Cilantro",
      "Crema de leche",
      "Alcaparras",
      "Arroz blanco",
      "Yuca",
      "Ajo",
    ],
    timeLimit: 15,
  },
  {
    name: "Empanadas",
    ingredients: [
      "Carne picada",
      "Cebolla",
      "Pimiento",
      "Huevo duro",
      "Aceitunas",
    ],
    availableIngredients: [
      "Carne picada",
      "Cebolla",
      "Pimiento",
      "Huevo duro",
      "Aceitunas",
      "Masa para empanadas",
      "Comino",
      "Pimentón",
      "Aceite",
      "Sal",
    ],
    timeLimit: 15,
  },
  {
    name: "Lomo Saltado",
    ingredients: [
      "Lomo de res",
      "Cebolla",
      "Tomate",
      "Ají amarillo",
      "Papas fritas",
    ],
    availableIngredients: [
      "Lomo de res",
      "Cebolla",
      "Tomate",
      "Ají amarillo",
      "Papas fritas",
      "Arroz",
      "Vinagre",
      "Sillao (salsa de soja)",
      "Cilantro",
      "Ajo",
    ],
    timeLimit: 15, // Tiempo límite en minutos
  },
  {
    name: "Milanesa a la Napolitana",
    ingredients: [
      "Milanesa de carne",
      "Jamón",
      "Queso",
      "Salsa de tomate",
      "Orégano",
    ],
    availableIngredients: [
      "Milanesa de carne",
      "Jamón",
      "Queso",
      "Salsa de tomate",
      "Orégano",
      "Papas fritas",
      "Ensalada mixta",
      "Limón",
      "Aceite",
      "Sal",
    ],
    timeLimit: 10,
  },
  {
    name: "Arepa de Choclo",
    ingredients: ["Maíz tierno", "Queso", "Mantequilla", "Azúcar", "Sal"],
    availableIngredients: [
      "Maíz tierno",
      "Queso",
      "Mantequilla",
      "Azúcar",
      "Sal",
      "Huevo",
      "Leche",
      "Harina de trigo",
      "Natilla",
      "Bocadillo (guayaba)",
    ],
    timeLimit: 20,
  },
  {
    name: "Sancocho",
    ingredients: ["Pollo", "Yuca", "Plátano", "Mazorca", "Cilantro"],
    availableIngredients: [
      "Pollo",
      "Yuca",
      "Plátano",
      "Mazorca",
      "Cilantro",
      "Papa",
      "Zanahoria",
      "Cebolla",
      "Ajo",
      "Aceite",
    ],
    timeLimit: 10,
  },
  {
    name: "Alfajores",
    ingredients: [
      "Harina de trigo",
      "Maicena",
      "Dulce de leche",
      "Azúcar impalpable",
      "Manteca",
    ],
    availableIngredients: [
      "Harina de trigo",
      "Maicena",
      "Dulce de leche",
      "Azúcar impalpable",
      "Manteca",
      "Chocolate",
      "Coco rallado",
      "Vainilla",
      "Limón",
      "Leche condensada",
    ],
    timeLimit: 15,
  },
];

// const cooldownTime = 10 * 60 * 1000; // 10 minutos en milisegundos
// const cooldowns = new Map();

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
module.exports = ChatCommand({
  name: "cook",
  description: "Participa en un concurso de cocina y gana o pierde dinero",
  async execute(client, interaction) {
    const discordId = interaction.user.id;

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

    const dish = dishes[Math.floor(Math.random() * dishes.length)];
    const shuffledIngredients = shuffle([...dish.availableIngredients]);

    let description = `🍳 ¡Bienvenido al concurso de cocina! Tu desafío es preparar: **${dish.name}**\n\n`;
    description += "Ingredientes disponibles:\n";
    shuffledIngredients.forEach((ingredient, index) => {
      description += `${index + 1}. ${ingredient}\n`;
    });
    description += `\nCantidad de ingredientes necesarios: ${dish.ingredients.length}\n`;
    description += `Tiempo límite: 30 segundos\n\n`;
    description +=
      "Selecciona los índices de los ingredientes que deseas utilizar separados por espacios (por ejemplo: 1 3 5)\n\n";

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("🍳 Concurso de Cocina")
      .setDescription(description);

    await interaction.reply({ embeds: [embed] });

    // Esperar la respuesta del jugador con los ingredientes seleccionados
    const ingredientFilter = (m) => m.author.id === interaction.user.id;
    const ingredientCollector = interaction.channel.createMessageCollector({
      filter: ingredientFilter,
      time: 30 * 1000,
      max: 1,
    });

    let selectedIngredients = [];

    ingredientCollector.on("collect", (m) => {
      const selectedIndices = m.content.split(" ").map(Number);
      selectedIngredients = selectedIndices.map(
        (index) => shuffledIngredients[index - 1]
      );
    });

    ingredientCollector.on("end", async (collected) => {
      if (collected.size === 0) {
        const noParticipantsEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ No hubo participantes")
          .setDescription(
            "No se recibió ninguna respuesta dentro del tiempo límite."
          );

        // cooldowns.set(discordId, Date.now());
        return interaction.followUp({ embeds: [noParticipantsEmbed] });
      }

      let correctIngredients = 0;
      let incorrectIngredients = 0;

      selectedIngredients.forEach((ingredient) => {
        if (dish.ingredients.includes(ingredient)) {
          correctIngredients++;
        } else {
          incorrectIngredients++;
        }
      });

      const totalIngredients = dish.ingredients.length;
      const score = (correctIngredients / totalIngredients) * 100;
      const isWin = score >= 50;

      let participantResult = `**${interaction.user.username}**\n`;
      participantResult += `Ingredientes seleccionados: ${selectedIngredients.join(
        ", "
      )}\n`;
      participantResult += `Ingredientes Correctos: ${correctIngredients}/${totalIngredients}\n`;
      participantResult += `Ingredientes Incorrectos: ${incorrectIngredients}\n`;
      participantResult += `% Completado: ${score.toFixed(2)}%\n`;

      if (isWin) {
        const winnings = correctIngredients * 1000; // Ganancias basadas en la cantidad de ingredientes correctos

        // Actualizar el saldo del usuario
        let userProfile = await User.findOne({
          discordId,
          guildId: interaction.guild.id,
        });
        if (!userProfile) {
          userProfile = new User({
            guildId: interaction.guild.id,
            discordId,
            username: interaction.user.username,
            balance: {
              cash: 0,
              bank: 0,
              total: 0,
            },
          });
          await userProfile.save();
        }

        userProfile.balance.cash += winnings;
        userProfile.balance.total =
          userProfile.balance.cash + userProfile.balance.bank;

        await userProfile.save();

        participantResult += `Ganancias: $${winnings}\n`;
      } else {
        const loss = incorrectIngredients * 2000; // Pérdida basada en la cantidad de ingredientes incorrectos

        let userProfile = await User.findOne({
          discordId,
          guildId: interaction.guild.id,
        });
        if (!userProfile) {
          userProfile = new User({
            guildId: interaction.guild.id,
            discordId,
            username: interaction.user.username,
            balance: {
              cash: 0,
              bank: 0,
              total: 0,
            },
          });
          await userProfile.save();
        }

        if (userProfile.balance.cash >= loss) {
          userProfile.balance.cash -= loss;
          userProfile.balance.total =
            userProfile.balance.cash + userProfile.balance.bank;
          await userProfile.save();
        }

        participantResult += `Pérdida: $${loss}\n`;
      }

      const resultEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📊 Resultados del Concurso de Cocina")
        .setDescription(participantResult);

      // cooldowns.set(discordId, Date.now());
      await interaction.followUp({ embeds: [resultEmbed] });
    });
  },
});
