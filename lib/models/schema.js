// schema.js
const mongoose = require("mongoose");


const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

// Esquema para Usuarios
const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  balance: {
    cash: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  inventory: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
      quantity: { type: Number, default: 0 },
      expirationTime: { type: Date, default: null },
    },
  ],
  investments: [
    {
      bankId: { type: mongoose.Schema.Types.ObjectId, ref: "Bank" },
      amount: { type: Number, required: true },
      dateInvested: { type: Date, default: Date.now },
    },
  ],
  roles: [{ type: String }],

  bankCode: { type: String, unique: true, sparse: true },
  lastCollect: { type: Date, default: Date.now },
});

// Esquema para Items
const itemSchema = new mongoose.Schema({
  itemNumber: { type: Number, unique: true, required: true },
  name: { type: String, required: true, unique: true },
  description: String,
  roleRequired: String,
  roleAdd: String,
  roleRemove: [String],
  stock: { type: Number, default: Infinity },
  price: { type: Number, required: true },
  visibility: Boolean,
  timeLimit: Number,
  message: String,
});

// Esquema para Bancos
const bankSchema = new mongoose.Schema({
  bankName: { type: String, required: true, unique: true },
  interestRate: { type: Number, required: true }, // Porcentaje de interés por semana
  minInvestment: { type: Number, required: true },
  maxInvestment: { type: Number, required: true },
  lockPeriod: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ["bajo", "medio", "alto"] },
});

// Esquema para Transacciones
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "transfer",
      "pay",
      "withdraw",
      "deposit",
      "purchase",
      "collect",
      "bet",
      "use",
    ],
    required: true,
  },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  reason: String,
  itemUsed: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
});

// Esquema para Roles y Recompensas
const roleSchema = new mongoose.Schema({
  discordRoleId: { type: String, required: true, unique: true },
  collectAmount: Number,
  collectInterval: Number,
  benefits: [String],
  autoRemove: { type: Number },
});

// Esquema para representar las apuestas disponibles
const BetSchema = new mongoose.Schema({
  liga : { type: String, required: true },
  date : { type: Date, required: true},
  betId: { type: String, required: true }, // ID de la apuesta
  region : { type: String, required: true },
  eventId: { type: String, required: true }, // ID del evento de la apuesta
  description: { type: String, required: true }, // Descripción de la apuesta
  bets: [
    {
      index: { type: Number, required: true }, // Índice de la apuesta
      description: { type: String, required: true }, // Descripción de la apuesta
      cuota: { type: Number, required: true }, // Cuota de la apuesta
    },
  ],
  ganador : { type : Array, required: true }, // Ganador de la apuesta
  status : { type: String, enum : ["open", "closed"], default: "closed" }, //
});

// Esquema para representar las apuestas realizadas por los usuarios
const UserBetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ID del usuario que realizó la apuesta
  betId: { type: mongoose.Schema.Types.ObjectId, ref: "Bet", required: true }, // ID de la apuesta
  codigo : { type: String, required: true }, // Código de la apuesta
  amount: { type: Number, required: true }, // Cantidad de economía apostada
  option : { type: Number, required: true }, // Opción seleccionada por el usuario
  winner: { type: String }, // Opción ganadora seleccionada por el usuario
  status: {
    type: String,
    enum: ["pending", "won", "lost"],
    default: "pending",
  }, // Estado de la apuesta (pendiente, ganada, perdida)
  createdAt: { type: Date, default: Date.now }, // Fecha de creación de la apuesta
});

// Esquema para representar el historial de apuestas de un usuario
const UserBetHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ID del usuario
  betId: { type: mongoose.Schema.Types.ObjectId, ref: "Bet", required: true }, // ID de la apuesta
  encuentro : { type: String, required: true }, // Encuentro de la apuesta
  betInfo : { type: String, required: true }, // Información de la apuesta
  metodo :  { type: String, required: true }, // Método de la apuesta
  ganancia : { type: Number, required: true }, // Ganancia de la apuesta
  amount: { type: Number, required: true }, // Cantidad apostada
  outcome: { type: String, required: true }, // Resultado de la apuesta (ganada, perdida)
  createdAt: { type: Date, default: Date.now }, // Fecha de creación de la apuesta
});

userSchema.index({ "balance.total": 1 });

// Crear modelos
const User = mongoose.model("User", userSchema);
const Item = mongoose.model("Item", itemSchema);
const Bank = mongoose.model("Bank", bankSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Role = mongoose.model("Role", roleSchema);
// const Profession = mongoose.model("Profession", professionSchema);
const Config = mongoose.model("Config", configSchema);
const Bet = mongoose.model("Bet", BetSchema);
const UserBet = mongoose.model("UserBet", UserBetSchema);
const UserBetHistory = mongoose.model("UserBetHistory", UserBetHistorySchema);

module.exports = {
  User,
  // Profession,
  Item,
  Bank,
  Transaction,
  Role,
  Config,
  Bet,
  UserBet,
  UserBetHistory,
};
