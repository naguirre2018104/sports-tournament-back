const express = require("express");
const passport = require("passport");

const log = require("../../../utils/logger");
const validateSoccerGame = require("./soccerGame.validate").validateSoccerGame;
const validateUpdate = require('./soccerGame.validate').validateUpdate;
const soccerGameController = require("./soccerGame.controller");
const matchDayController = require("../matchDay/matchDay.controller");
const procesarErrores = require("../../libs/errorHandler").procesarErrores;
const {
  SoccerGameDataAlreadyInUse,
  SoccerGameDoesNotExist,
} = require("./soccerGame.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const soccerGameRouter = express.Router();

function validarId(req, res, next) {
  let id = req.params.id;
  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res
      .status(400)
      .send({ message: `El id [${id}] suministrado en el URL no existe` });
    return;
  }
  next();
}

soccerGameRouter.get(
  "/",
  jwtAuthenticate,
  procesarErrores((req, res) => {
    return soccerGameController.foundSoccerGame().then((soccerGame) => {
      res.send({ message: "Partidos encontrados", soccerGame: soccerGame });
    });
  })
);

soccerGameRouter.post(
  "/create/:idMD/:idT1/:idT2",
  [jwtAuthenticate, validateSoccerGame],
  procesarErrores(async (req, res) => {
    let newSoccerGame = req.body;
    let goalsTeamOne = req.body.goalsTeamOne;
    let goalsTeamTwo = req.body.goalsTeamTwo;
    let idMatchDay = req.params.idMD;
    let idTeamOne = req.params.idT1;
    let idTeamTwo = req.params.idT2;
    let soccerGameExisting;

    soccerGameExisting = await soccerGameController.foundOneSoccerGame({
      dateMatch: newSoccerGame.dateMatch,
    });

    if (soccerGameExisting) {
      log.warn(
        `Ya existe un partido con la fecha [${newSoccerGame.dateMatch}]`
      );
      throw new SoccerGameDataAlreadyInUse();
    }

    soccerGameController
      .createSoccerGame(
        newSoccerGame,
        idTeamOne,
        goalsTeamOne,
        idTeamTwo,
        goalsTeamTwo
      )
      .then((soccerGame) => {
        log.debug(`El partido fue creado`);
        matchDayController
          .setSoccerGame(idMatchDay, soccerGame.id)
          .then((matchDayUpdated) => {
            res
              .status(201)
              .send({
                message: "El partido fue creado con exito",
                soccerGame: soccerGame,
              });
            log.info(
              `El dia del partido con id [${idMatchDay}] ha sido actualizado con un partido`
            );
          });
      });
  })
);

soccerGameRouter.put(
  "/:id",
  [jwtAuthenticate, validateUpdate, validarId],
  procesarErrores(async (req, res) => {
    let id = req.params.id;
    let updateSoccerGame;

    updateSoccerGame = await soccerGameController.foundOneSoccerGame({
      id: id,
    });

    if (!updateSoccerGame) {
      log.warn(
        `El partido con id [${id}] que busca no existe en la base de datos`
      );
      throw new SoccerGameDoesNotExist();
    }

    soccerGameController
      .updateSoccerGame(
        id,
        req.body
      )
      .then((soccerGame) => {
        res
          .status(200)
          .send({ message: "Partido actualizado", soccerGame: soccerGame });
        log.info(`El partido con id [${id}] ha sido actualizado`);
      });
  })
);

soccerGameRouter.delete(
  "/:id/:idM",
  [jwtAuthenticate],
  procesarErrores(async (req, res) => {
    let id = req.params.id;
    let idMatchDay = req.params.idM;
    let soccerGameDelete;

    soccerGameDelete = await soccerGameController.foundOneSoccerGame({
      id: id,
    });

    if (!soccerGameDelete) {
      log.warn(
        `El partido con id [${id}] que busca no existe en la base de datos`
      );
      throw new SoccerGameDoesNotExist();
    }

    let soccerGameRemoved = await soccerGameController.deleteSoccerGame(id);
    log.debug(`El partido con id [${id}] ha sido eliminado con exito`);
    matchDayController.deleteSoccerGame(idMatchDay, id).then((matchDayUpdated) => {
      res
      .status(200)
      .send({ message: "Partido eliminado", soccerGame: soccerGameRemoved });
      log.debug(`El partido fue eliminado en el dia del partido con id [${idMatchDay}]`)
    })
    
  })
);

module.exports = soccerGameRouter;
