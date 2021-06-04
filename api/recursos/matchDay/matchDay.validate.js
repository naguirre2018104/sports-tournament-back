const Joi = require('@hapi/joi')
const log = require('../../../utils/logger')

const blueprintMatchDay = Joi.object({
    name: Joi.string().min(2).max(200).required()
})

let validateMatchDay = (req, res, next) => {
    const resultado = blueprintMatchDay.validate(req.body, {abortEarly: false, convert: false})
    if(resultado.error === undefined){
        next();
    }else{
        log.debug(`Fallo en la validacion del dia del partido: ${resultado.error.details.map((error) => error.message)}`)
        res.status(400).send({message: "Informacion del dia del partido no cumple con los requisitos. Asegurece de tener un nombre para ese dia"})
    }
}   

module.exports = {
    validateMatchDay
}