const mongoose = require("mongoose");

const leagueSchema = new mongoose.Schema({
  name: { type: String, required: [true, "La liga necesita un nombre"] },
  user: { type: mongoose.Schema.ObjectId, ref: "user" },
  teams: [{ type: mongoose.Schema.ObjectId, ref: "team" }],
  matchesTeams: [{ type: mongoose.Schema.ObjectId, ref: "matchDay" }],
  reports: [{ type: mongoose.Schema.ObjectId, ref: "report" }],
});

module.exports = mongoose.model("league", leagueSchema);
