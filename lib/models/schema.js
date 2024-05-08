// schema.js
const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

configSchema.index({ guildId: 1, key: 1 }, { unique: true });

// Esquema para Usuarios
const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  guildId: { type: String, required: true },
  username: { type: String, required: true },
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
  bankCode: { type: String },
  lastCollect: { type: Date, default: Date.now },
});

userSchema.index({ discordId: 1, guildId: 1 }, { unique: true });
userSchema.index({ "balance.total": 1 });

// Esquema para Items
const itemSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  itemNumber: { type: Number, required: true },
  name: { type: String, required: true },
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

itemSchema.index({ guildId: 1, itemNumber: 1 }, { unique: true });
itemSchema.index({ guildId: 1, name: 1 }, { unique: true });

// Esquema para Bancos
const bankSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  bankName: { type: String, required: true },
  interestRate: { type: Number, required: true },
  minInvestment: { type: Number, required: true },
  maxInvestment: { type: Number, required: true },
  lockPeriod: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ["bajo", "medio", "alto"] },
});

bankSchema.index({ guildId: 1, bankName: 1 }, { unique: true });

// Esquema para Transacciones
const transactionSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
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
  guildId: { type: String, required: true },
  discordRoleId: { type: String, required: true },
  collectAmount: Number,
  collectInterval: Number,
  benefits: [String],
  autoRemove: { type: Number },
});

roleSchema.index({ guildId: 1, discordRoleId: 1 }, { unique: true });

// Esquema para representar las apuestas disponibles
const BetSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  liga: { type: String, required: true },
  date: { type: Date, required: true },
  betId: { type: String, required: true },
  region: { type: String, required: true },
  eventId: { type: String, required: true },
  description: { type: String, required: true },
  bets: [
    {
      index: { type: Number, required: true },
      description: { type: String, required: true },
      cuota: { type: Number, required: true },
    },
  ],
  ganador: { type: Array, required: true },
  status: { type: String, enum: ["open", "closed"], default: "closed" },
});

// Esquema para representar las apuestas realizadas por los usuarios
const UserBetSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  betId: { type: mongoose.Schema.Types.ObjectId, ref: "Bet", required: true },
  codigo: { type: String, required: true },
  amount: { type: Number, required: true },
  option: { type: Number, required: true },
  winner: { type: String },
  status: {
    type: String,
    enum: ["pending", "won", "lost"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

// Esquema para representar el historial de apuestas de un usuario
const UserBetHistorySchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  betId: { type: mongoose.Schema.Types.ObjectId, ref: "Bet", required: true },
  encuentro: { type: String, required: true },
  betInfo: { type: String, required: true },
  metodo: { type: String, required: true },
  ganancia: { type: Number, required: true },
  amount: { type: Number, required: true },
  outcome: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Crear modelos
const User = mongoose.model("User", userSchema);
const Item = mongoose.model("Item", itemSchema);
const Bank = mongoose.model("Bank", bankSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Role = mongoose.model("Role", roleSchema);
const Config = mongoose.model("Config", configSchema);
const Bet = mongoose.model("Bet", BetSchema);
const UserBet = mongoose.model("UserBet", UserBetSchema);
const UserBetHistory = mongoose.model("UserBetHistory", UserBetHistorySchema);

module.exports = {
  User,
  Item,
  Bank,
  Transaction,
  Role,
  Config,
  Bet,
  UserBet,
  UserBetHistory,
};
