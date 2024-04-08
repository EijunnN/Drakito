// // xd.js

const { parse } = require("path");

// require("dotenv").config();
// const mongoose = require("mongoose");

// const { UserModel } = require("./lib/models/schema");
// let isConnected = false;

// const connectToDB = async () => {
//   mongoose.set("strictQuery", true);

//   if (!process.env.MONGODB_URI) {
//     console.log("MONGODB_URI is not defined");
//     return;
//   }

//   if (isConnected) {
//     console.log("=> Base de datos ya conectada");
//     return;
//   }

//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     isConnected = true;
//     console.log("MongoDB Connected");

//     // Llamada a la función para actualizar los mvpPoints
//     resetMvpPoints();
//   } catch (error) {
//     console.error(error);
//   }
// };

// connectToDB();
// // Función para actualizar los mvpPoints a 0 para todos los usuarios
// const resetMvpPoints = () => {
//   UserModel.updateMany({}, { $set: { mvpPoints: 0 } })
//     .then(result => {
//       console.log(`Usuarios actualizados: ${result.nModified}`);
//     })
//     .catch(err => {
//       console.error('Error al actualizar los usuarios', err);
//     });
// };

// module.exports = { connectToDB };

const lineaGoles = {
  description: "mas de 1.5 goles",
};

// operador debe ser mas y linea debe ser 1.5

const operador = lineaGoles.description.split(" ")[0];
const linea = lineaGoles.description.split(" ")[2];

console.log(operador, linea);

let floatxd = "1.5";
let act = Math.floor(floatxd);
let act2 = parseFloat(floatxd);
console.log(act);
console.log(act2);
