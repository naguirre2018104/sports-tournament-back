const mongoose = require("mongoose");

const matchDaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Se necesita un nombre"],
  },
  soccerGame: [{ type: mongoose.Schema.ObjectId, ref: "soccerGame" }],
});

module.exports = mongoose.model("matchDay", matchDaySchema);
