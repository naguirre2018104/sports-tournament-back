const MatchDay = require("./matchDay.model");

function foundMatchDay() {
  return MatchDay.find({}).populate("soccerGame");
}

function createMatchDay(matchDay) {
  return new MatchDay({
    ...matchDay,
  }).save();
}
function deleteMatchDay(id) {
  return MatchDay.findByIdAndRemove(id);
}

function updateMatchDay(id, matchDay) {
  return MatchDay.findOneAndUpdate({ _id: id }, { ...matchDay }, { new: true });
}

function setSoccerGame(id, soccerGame) {
  return MatchDay.findOneAndUpdate(
    { _id: id },
    { $push: { soccerGame: soccerGame } },
    { new: true }
  );
}

function deleteSoccerGame(id, soccerGame) {
  return MatchDay.findOneAndUpdate(
    { _id: id },
    { $pull: { soccerGame: soccerGame } },
    { new: true }
  );
}

function existingMatchDay(name) {
  return new Promise((resolve, reject) => {
    MatchDay.find()
      .or([{ name: name }])
      .populate("soccerGame")
      .then((matchDay) => {
        resolve(matchDay.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function foundOneMatchDay({ name: name, id: id }) {
  if (name) {
    return MatchDay.findOne({ name: name }).populate("soccerGame");
  }
  if (id) {
    return MatchDay.findById(id).populate("soccerGame");
  }
  throw new Error(
    "Funcion obtener el dia del partido del controlador fue llamado sin especificar el nombre o el id"
  );
}

module.exports = {
  createMatchDay,
  updateMatchDay,
  deleteMatchDay,
  setSoccerGame,
  existingMatchDay,
  foundOneMatchDay,
  foundMatchDay,
  deleteSoccerGame
};
