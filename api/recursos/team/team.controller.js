const Team = require("./team.model");
const log = require("../../../utils/logger");

function foundTeam() {
  return Team.find({});
}

function createTeam(team) {
  return new Team({
    ...team,
  }).save();
}

function deleteTeam(id) {
  return Team.findByIdAndRemove(id);
}

function updateTeam(id, team) {
  return Team.findOneAndUpdate({ _id: id }, { ...team }, { new: true });
}

function existingTeam(name) {
  return new Promise((resolve, reject) => {
    Team.find()
      .or([{ name: name }])
      .then((teams) => {
        resolve(teams.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function foundOneTeam({ name: name, id: id }) {
  if (name) {
    return Team.findOne({ name: name });
  }
  if (id) {
    return Team.findById(id);
  }
  throw new Error(
    "Funcion obtener un equipo del controlador fue llamado sin especificar el nombre o el id"
  );
}

function saveImg(id, imageUrl) {
  return Team.findOneAndUpdate({ _id: id }, { img: imageUrl }, { new: true });
}

module.exports = {
  createTeam,
  foundTeam,
  foundOneTeam,
  deleteTeam,
  updateTeam,
  saveImg,
  existingTeam,
};
