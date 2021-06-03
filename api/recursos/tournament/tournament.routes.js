const express = require('express');
const passport = require('passport');

const log = require('../../../utils/logger')
const validateTournament = require('./tournament.validate').validateTournament;
const tournamentController = require('./tournament.controller')
const procesarErrores = require('../../libs/errorHandler').procesarErrores;
const { TournamentDoesNotExist, TournamentDataAlreadyInUse } = require('./tournament.error')
const { InvalidUserRole } = require('../user/user.error')
const jwtAuthenticate = passport.authenticate('jwt', {session: false});
const tournamentRouter = express.Router();

function transformBodyToLowerCase(req, res, next){
    req.body.name && (req.body.name = req.body.name.toLowerCase())
    next();
}

function validarId(req, res, next){
    let id = req.params.id;
    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400).send({message: `El id [${id}] suministrado en el URL no es valido`})
        return
    }
    next();
}

tournamentRouter.get('/', jwtAuthenticate, procesarErrores((req, res) => {
    return tournamentController.foundTournament().then((tournaments) => {
        res.send({message: "Torneos encontrados", tournament: tournaments})
    })
}))

tournamentRouter.get('/oneTournament/:id', [jwtAuthenticate, validarId], procesarErrores((req, res) => {
    let id = req.params.id
    return tournamentController.foundOneTournament({id: id}).then((foundTournament) => {
        res.status(200).send({message: "Torneo encontrado", tournament: foundTournament})
    })
}))

tournamentRouter.post('/create', [jwtAuthenticate, validateTournament, transformBodyToLowerCase], procesarErrores(async (req, res) => {
    let newTournament = req.body;
    let tournamentExisting;

    if(req.user.role != 'ROLE_ADMIN'){
        log.warn(`El usuario con nombre [${req.user.username}] no es administrador`)
        throw new InvalidUserRole();
    }

    tournamentExisting = await tournamentController.foundOneTournament({name: newTournament.name})

    if(tournamentExisting){
        log.warn(`Ya existe un torneo con el nombre [${tournamentExisting.name}]`)
        throw new TournamentDataAlreadyInUse();
    }

    tournamentController.createTournament(newTournament).then((tournament) => {
        res.status(201).send({message: "Torneo creado", tournament: tournament})
        log.info(`El torneo ha sido creado con exito`)
    })
    
}))

tournamentRouter.put('/:id', [jwtAuthenticate, validarId, validateTournament], procesarErrores(async (req, res) => {
    let id = req.params.id;
    let updateTournament;

    updateTournament = await tournamentController.foundOneTournament({id: id})

    if(!updateTournament){
        log.warn(`El torneo con id [${id}] que busca no existe en la base de datos`)
        throw new TournamentDoesNotExist();
    }

    if(req.user.role != "ROLE_ADMIN"){
        log.warn(`El usuario con nombre [${req.user.username}] no es administrador`)
        throw new InvalidUserRole();
    }

    tournamentController.updateTournament(id, req.body).then((tournament) => {
        res.status(200).send({message: "Torneo actualizado", tournament: tournament})
        log.info(`Torneo con id [${id}] ha sido actualizado`)
    })
}))

tournamentRouter.delete('/:id', [jwtAuthenticate, validarId], procesarErrores(async (req, res) => {
    let id = req.params.id;
    let tournamentDelete;

    tournamentDelete = await tournamentController.foundOneTournament({id: id})

    if(!tournamentDelete){
        log.warn(`El torneo con id [${id}] que busca no existe en la base de datos`)
        throw new TournamentDoesNotExist();
    }

    let tournamentRemoved = await tournamentController.deleteTournament(id)
    res.status(200).send({message: "Torneo eliminado", tournament: tournamentRemoved})
    log.info(`El torneo con id [${id}] ha sido eliminado con exito`)

}))

module.exports = tournamentRouter;