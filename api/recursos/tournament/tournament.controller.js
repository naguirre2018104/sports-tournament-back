const Tournament = require("./tournament.model");

function foundTournament() {
  return Tournament.find({}).populate("leagues");
}

function createTournament(tournament) {
  return new Tournament({
    ...tournament,
  }).save();
}

function deleteTournament(id) {
  return Tournament.findByIdAndRemove(id);
}

function updateTournament(id, tournament) {
  return Tournament.findOneAndUpdate(
    { _id: id },
    { ...tournament },
    { new: true }
  );
}

function setLeague(id, league) {
  return Tournament.findOneAndUpdate(
    { _id: id },
    { $push: { leagues: league } },
    { new: true }
  );
}

function existingTournament(name) {
  return new Promise((resolve, reject) => {
    Tournament.find()
      .or([{ name: name }])
      .populate("leagues")
      .then((tournament) => {
        resolve(tournament.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function foundOneTournament({ name: name, id: id }) {
  if (name) {
    return Tournament.findOne({ name: name }).populate("leagues");
  }
  if (id) {
    return Tournament.findById(id).populate("leagues");
  }
  throw new Error(
    "Funcion obtener un torneo del controlador fue llamado sin especificar el nombre o el id"
  );
}

module.exports = {
  createTournament,
  foundTournament,
  updateTournament,
  deleteTournament,
  existingTournament,
  foundOneTournament,
  setLeague,
};
