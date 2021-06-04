class MatchDayDataAlreadyInUse extends Error{
    constructor(message){
        super(message);
        this.message = message || 'Los datos de este dia ya existen en la base de datos';
        this.status = 409;
        this.name = 'MatchDayDataAlreadyInUse'
    }
}

class MatchDayDoesNotExist extends Error{
    constructor(message){
        super(message);
        this.message = message || 'El dia que busca no existe en la base de datos';
        this.status = 204;
        this.name = 'MatchDayDoesNotExist';
    }
}

module.exports = {
    MatchDayDataAlreadyInUse,
    MatchDayDoesNotExist
}