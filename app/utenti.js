const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
const Utente = require('./models/utente');

router.get('/:id/asteVinte', async function(req, res){
    let aste = await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).exec();

    let venditore = [];

    for(let i = 0; i < aste.length; i++){
        venditore[i] = await Utente.findOne({_id: aste[i].DettagliAsta.Venditore}, { Username: 1}).exec();
    }

    let j = -1;
    aste = aste.map( (asta) => {
        j++;
        return {
            self: '/api/v1/aste/' + asta._id,
            idAsta: asta._id,
            dettagliProdotto: asta.DettagliProdotto,
            inizioAsta: asta.DettagliAsta.Inizio,
            fineAsta: asta.DettagliAsta.Fine,
            tipoAsta: asta.DettagliAsta.Tipo,
            venditoreAsta: venditore[j],
            offertaVincente: asta.DettagliAsta.Offerte[0]
        };
    });
    res.status(200).json(aste);
});

module.exports = router;