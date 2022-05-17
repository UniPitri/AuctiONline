var mongoose = require('mongoose')
var Schema = mongoose.Schema

//Imposto il modello mongoose degli utenti
module.exports = mongoose.model('Aste', new Schema({ 
	DettagliProdotto: {
        Nome: String,
        Categorie: [Number],
        Descrizione: String,
        Foto: [String]
    },
    DettagliAsta: {
        Inizio: Date,
        Fine: Date,
        Tipo: Number,
        PrezzoMinimo: Number
    },
    Preferenze: [Schema.Types.ObjectId]
}, {collection: 'Aste'}));