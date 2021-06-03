const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: [true, "el torneo necesita un nombre"] },
  leagues: [{ type: mongoose.Schema.ObjectId, ref: "league" }],
});

module.exports = mongoose.model("torneo", tournamentSchema);
