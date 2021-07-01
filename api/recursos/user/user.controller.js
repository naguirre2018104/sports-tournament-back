const User = require("./user.model");
const bcrypt = require("bcrypt");
const log = require("../../../utils/logger");
const { UserDataAlreadyInUse } = require("./user.error");

function foundUser() {
  return User.find({})
    .populate("history")
    .populate({path: "leagues", populate:{path: "teams"}});
}

function createUser(user, hashedPassword) {
  return new User({
    ...user,
    password: hashedPassword,
  }).save();
}

function createUserAdmin() {
  let passwordAdmin = "deportes123";
  User.findOne({ username: "admin" })
    .then((userAdminFound) => {
      if (userAdminFound) {
        log.info(`El usuario administrador por defecto ya esta creado`);
        return;
      }
      return bcrypt.hash(passwordAdmin, 10);
    })
    .then((hash) => {
      new User({
        username: "admin",
        password: hash,
        name: "administrador",
        lastname: "administrador",
        role: "ROLE_ADMIN",
        img: "",
      }).save();
      log.info("Usuario administrador por defecto creado con exito");
    });
}

function deleteUser(id) {
  return User.findByIdAndRemove(id);
}

function updateUser(id, user) {
  return User.findOneAndUpdate(
    { _id: id },
    {
      ...user,
    },
    {
      new: true,
    }
  );
}

function setHistory(id, history) {
  return User.findOneAndUpdate(
    { _id: id },
    { $push: { history: history } },
    { new: true }
  );
}

function setLeague(id, idLeague) {
  return User.findOneAndUpdate(
    { _id: id },
    { $push: { leagues: idLeague } },
    { new: true }
  );
}

function deleteLeague(id, idLeague) {
  return User.findOneAndUpdate(
    { _id: id },
    { $pull: { leagues: idLeague } },
    { new: true }
  );
}

function existingUser(username) {
  return new Promise((resolve, reject) => {
    User.find()
      .or([{ username: username }])
      .populate("history")
      .populate("tournamentsAdmin")
      .populate("tournamentsUser")
      .then((users) => {
        resolve(users.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function foundOneUser({ username: username, id: id }) {
  if (username) {
    return User.findOne({ username: username })
      .populate("history")
      .populate({path: "leagues", populate:{path: "teams"}});
  }
  if (id) {
    return User.findById(id)
    .populate("history")
    .populate({path: "leagues", populate:{path: "teams"}});
  }
  throw new Error(
    "Funcion obtener un usuario del controlador fue llamado sin especificar el username o id"
  );
}

function saveimg(id, imageUrl) {
  return User.findOneAndUpdate({ _id: id }, { img: imageUrl }, { new: true });
}

module.exports = {
  createUser,
  foundUser,
  deleteUser,
  updateUser,
  setHistory,
  setLeague,
  deleteLeague,
  existingUser,
  foundOneUser,
  saveimg,
  createUserAdmin,
};
