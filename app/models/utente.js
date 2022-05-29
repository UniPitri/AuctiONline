var mongoose = require('mongoose')
var Schema = mongoose.Schema

//Imposto il modello mongoose degli utenti
module.exports = mongoose.model('Utenti', new Schema({ 
	Username: String,
    Password: String,
    Mail: String,
    AstePreferite: [{ type: Schema.Types.ObjectId, ref: 'Aste' }]
}, {collection: 'Utenti'}));