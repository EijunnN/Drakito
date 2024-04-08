const { ChatCommand } = require("../../utils/commands");
const {
  Bet,
  UserBet,
  User,
  UserBetHistory,
} = require("../../../lib/models/schema");
const { ApplicationCommandOptionType } = require("discord.js");
const { rolePermission } = require("../../utils/allowedChannels");

module.exports = ChatCommand({
  name: "veredicto",
  description:
    "Establece el veredicto de una apuesta y actualiza los resultados",
  options: [
    {
      name: "id",
      description: "ID de la apuesta",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "marcador",
      description: "Marcador final del evento",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async execute(client, interaction) {

    if (!rolePermission.includes(interaction.member.roles.highest.id)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        ephemeral: true,
      });
    }

    try {
      const betId = interaction.options.getString("id");
      const marcador = interaction.options.getString("marcador");

      // Buscar la apuesta por su ID
      const bet = await Bet.findOne({ betId });
      if (!bet) {
        return interaction.reply({
          content: "La apuesta especificada no existe.",
          ephemeral: true,
        });
      }

      // Determinar las opciones ganadoras basadas en el marcador
      const [golLocal, golVisitante] = marcador.split("-").map(Number);
      const totalGoles = golLocal + golVisitante;
      const opcionesGanadoras = [];

      // Opción 1: Gana equipo local
      if (golLocal > golVisitante) {
        opcionesGanadoras.push(1);
      }

      // Opción 2: Empate
      if (golLocal === golVisitante) {
        opcionesGanadoras.push(2);
      }

      // Opción 3: Gana equipo visitante
      if (golLocal < golVisitante) {
        opcionesGanadoras.push(3);
      }

      // Opciones de línea de goles
      const lineaGolesOpciones = bet.bets.filter((b) =>
        b.description.includes("goles")
      );
      for (const lineaGoles of lineaGolesOpciones) {
        const operador = lineaGoles.description.split(" ")[0];
        const linea = lineaGoles.description.split(" ")[2];
        const lineaNumero = parseFloat(linea);
        if (operador === "más" && totalGoles > lineaNumero) {
          opcionesGanadoras.push(lineaGoles.index);
        } else if (operador === "menos" && totalGoles < lineaNumero) {
          opcionesGanadoras.push(lineaGoles.index);
        }
      }

      // Actualizar el estado de las apuestas de los usuarios
      await UserBet.updateMany(
        { betId: bet._id, option: { $in: opcionesGanadoras } },
        { $set: { status: "won", winner: true } }
      );

      await UserBet.updateMany(
        { betId: bet._id, option: { $nin: opcionesGanadoras } },
        { $set: { status: "lost" } }
      );

      // Actualizar el saldo de los usuarios ganadores
      const userBetsGanadas = await UserBet.find({
        betId: bet._id,
        status: "won",
      });

      for (const userBet of userBetsGanadas) {
        const user = await User.findById(userBet.userId);
        const cuota = bet.bets[userBet.option - 1].cuota;
        const ganancia = userBet.amount * cuota;

        user.balance.bank += ganancia;
        user.balance.total += ganancia;
        await user.save();
      }

      // Actualizar el historial de apuestas
      for (const userBet of userBetsGanadas) {
        await UserBetHistory.updateOne(
          { userId: userBet.userId, betId: bet._id },
          { $set: { outcome: "ganada" } }
        );
      }

      const userBetsPerdidas = await UserBet.find({
        betId: bet._id,
        status: "lost",
      });

      for (const userBet of userBetsPerdidas) {
        await UserBetHistory.updateOne(
          { userId: userBet.userId, betId: bet._id },
          { $set: { outcome: "perdida" } }
        );
      }

      // Marcar la apuesta como cerrada
      bet.status = "closed";
      await bet.save();

      return interaction.reply({
        content:
          "El veredicto de la apuesta ha sido establecido y los resultados han sido actualizados.",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error al establecer el veredicto:", error);
      return interaction.reply({
        content: "Ocurrió un error al establecer el veredicto de la apuesta.",
        ephemeral: true,
      });
    }
  },
});
