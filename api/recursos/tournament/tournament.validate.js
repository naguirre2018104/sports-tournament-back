const Joi = require('@hapi/joi')
const log = require('../../../utils/logger')

const blueprintTournament = Joi.object({
    name: Joi.string().min(4).max(200).required()
})

let validateTournament = (req, res, next) => {
    const resultado = blueprintTournament.validate(req.body, {abortEarly: false, convert: false});
    if(resultado.error === undefined){
        next();
    }else{
        log.debug(`Fallo en la validacion del torneo: ${resultado.error.details.map((error) => error.message)}`);
        res.status(400).send({menssage: "Informacion del torneo no cumple con los requisitos. El nombre del torneo tiene que tener entre 4 y 200 caracteres"})
    }
}

module.exports = {
    validateTournament
}