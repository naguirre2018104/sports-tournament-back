const express = require("express");
const passport = require("passport");

const log = require("../../../utils/logger");
const validateMatchDay = require("./matchDay.validate").validateMatchDay;
const matchDayController = require("./matchDay.controller");
const leagueController = require("../league/league.controller");
const procesarErrores = require("../../libs/errorHandler").procesarErrores;
const {
  MatchDayDataAlreadyInUse,
  MatchDayDoesNotExist,
} = require("./matchDay.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const matchDayRouter = express.Router();

function transformBodyToLowerCase(req, res, next) {
  req.body.name && (req.body.name = req.body.name.toLowerCase());
  next();
}

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

matchDayRouter.get(
  "/",
  jwtAuthenticate,
  procesarErrores((req, res) => {
    return matchDayController.foundMatchDay().then((matchDays) => {
      res.send({
        message: "Dias de los partidos encontrados",
        matchDay: matchDays,
      });
    });
  })
);

matchDayRouter.get(
  "/oneMatchDay/:id",
  [jwtAuthenticate, validarId],
  procesarErrores((req, res) => {
    let id = req.params.id;
    return matchDayController
      .foundOneMatchDay({ id: id })
      .then((foundMatchDay) => {
        res
          .status(200)
          .send({
            message: "Dia del partido encontrado",
            matchDay: foundMatchDay,
          });
      });
  })
);

matchDayRouter.post(
  "/create/:id",
  [jwtAuthenticate, validateMatchDay, transformBodyToLowerCase],
  procesarErrores(async (req, res) => {
    let newMatchDay = req.body;
    let idLeague = req.params.id;
    let matchDayExisting;

    matchDayExisting = await matchDayController.foundOneMatchDay({
      name: newMatchDay.name,
    });

    if (matchDayExisting) {
      log.warn(`Ya existe un dia con el nombre [${newMatchDay.name}]`);
      throw new MatchDayDataAlreadyInUse();
    }

    matchDayController.createMatchDay(newMatchDay).then((matchDay) => {
      log.debug("El dia del partido ha sido creado");
      leagueController
        .setMatchesTeams(idLeague, matchDay.id)
        .then((leagueUpdated) => {
          res
            .status(201)
            .send({ message: "Dia del partido creado", matchDay: matchDay });
          log.info(
            `La liga con id [${idLeague}] ha sido actualizada con un dia para un partido`
          );
        });
    });
  })
);

matchDayRouter.put(
  "/:id",
  [jwtAuthenticate, validarId, validateMatchDay],
  procesarErrores(async (req, res) => {
    let id = req.params.id;
    let updateMatchDay;

    updateMatchDay = await matchDayController.foundOneMatchDay({ id: id });

    if (!updateMatchDay) {
      log.warn(
        `El dia del partido con id [${id}] que busca no existe en la base de datos`
      );
      throw new MatchDayDoesNotExist();
    }

    matchDayController.updateMatchDay(id, req.body).then((matchDay) => {
      res
        .status(200)
        .send({ message: "Dia del partido actualizado", matchDay: matchDay });
      log.info(`Dia del partido con id [${id}] ha sido actualizado`);
    });
  })
);

matchDayRouter.delete(
  "/:id/:idL",
  [jwtAuthenticate],
  procesarErrores(async (req, res) => {
    let id = req.params.id;
    let idLeague = req.params.idL;
    let matchDayDelete;

    matchDayDelete = await matchDayController.foundOneMatchDay({ id: id });

    if (!matchDayDelete) {
      log.warn(
        `El dia del partido con id [${id}] que busca no existe en la base de datos`
      );
      throw new MatchDayDoesNotExist();
    }

    let matchDayRemoved = await matchDayController.deleteMatchDay(id);
    log.info(`El dia del partido con id [${id}] ha sido eliminado con exito`);
    leagueController.deleteMatchesTeams(idLeague, id).then((leagueUpdated) => {
      res
      .status(200)
      .send({
        message: "Dia del partido eliminado",
        matchDay: matchDayRemoved,
      });
    })
  
  })
);

module.exports = matchDayRouter;
