const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "El usuario necesita un username"],
  },
  password: {
    type: String,
    required: [true, "El usuario necesita una contraseña"],
  },
  name: { type: String, required: [true, "El usuario necesita un nombre"] },
  lastname: {
    type: String,
    required: [true, "El usuario necesita unos apellidos"],
  },
  role: { type: String, required: [true, "El usuario necesita un rol"] },
  img: { type: String },
  history: [{}],
  tournamentsAdmin: [{ type: mongoose.Schema.ObjectId, ref: "tournament" }],
  tournamentsUser: [{ type: mongoose.Schema.ObjectId, ref: "tournament" }],
});

module.exports = mongoose.model('user', userSchema)
