const League = require('./league.model');

function foundLeague(){
    return League.find({}).populate('user').populate('teams').populate('matchesTeams').populate('reports')
}

function createLeague(league){
    return new League({
        ...league
    }).save();
}

function deleteLeague(id){
    return League.findByIdAndRemove(id);
}

function updateLeague(id, league){
    return League.findOneAndUpdate({_id: id}, {...league}, {new: true})
}

function setUser(id, user){
    return League.findOneAndUpdate({_id: id}, {$push:{user:user}}, {new: true})
}

function setTeam(id, team){
    return League.findOneAndUpdate({_id: id}, {$push:{teams:team}}, {new:true})
}

function setMatchesTeams(id, matchesTeam){
    return League.findOneAndUpdate({_id: id}, {$push:{matchesTeams: matchesTeam}}, {new:true})
}

function setReports(id, report){
    return League.findOneAndUpdate({_id: id}, {$push:{reports: report}}, {new:true})
}

function existingLeague(name){
    return new Promise((resolve, reject) => {
        League.find().or([{name: name}]).populate('user').populate('teams').populate('matchesTeams').populate('reports')
        .then((league) => {
            resolve(league.length > 0)
        })
        .catch((err) => {
            reject(err);
        })
    })
}

function foundOneLeague({name: name, id: id}){
    if(name){
        return League.findOne({name: name}).populate('user').populate('teams').populate('matchesTeams').populate('reports')
    }
    if(id){
        return League.findById(id).populate('user').populate('teams').populate('matchesTeams').populate('reports')
    }
    throw new Error("Funcion obtener una liga del controlador fue llamado sin especificar el nombre o id")
}

module.exports = {
    createLeague,
    foundLeague,
    updateLeague,
    deleteLeague,
    setUser,
    setTeam,
    setMatchesTeams,
    setReports,
    existingLeague,
    foundOneLeague
}