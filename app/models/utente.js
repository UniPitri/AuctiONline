var mongoose = require('mongoose')
var Schema = mongoose.Schema

//Imposto il modello mongoose degli utenti
module.exports = mongoose.model('Utenti', new Schema({ 
	Username: String,
    Password: String,
    Salt: String,
    Mail: String,
    AstePreferite: [Schema.Types.ObjectId]
}, {collection: 'Utenti'}));