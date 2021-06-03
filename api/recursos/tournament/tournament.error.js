class TournamentDataAlreadyInUse extends Error{
    constructor(message){
        super(message);
        this.message = message || 'Los datos de este torneo ya existen en la base de datos';
        this.status = 409;
        this.name = "TournamentDataAlreadyInUse";
    }
}

class TournamentDoesNotExist extends Error{
    constructor(message){
        super(message);
        this.message = message || 'El torneo que busca no existe en la base de datos'
        this.status = 204;
        this.name = "TournamentDoesNotExist";
    }
}

module.exports = {
    TournamentDataAlreadyInUse,
    TournamentDoesNotExist
}