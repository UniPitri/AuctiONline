const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
const Utente = require('./models/utente');

router.get('/:id/asteVinte', async function(req, res){
    let aste = await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).exec();
    
    aste = aste.map( (asta) => {
        if(asta.DettagliAsta.Offerenti[asta.DettagliAsta.Offerenti.length-1].toString() == req.params.id){
            return {
                self: '/api/v1/aste/' + asta._id,
                idAsta: asta._id,
                dettagliProdotto: asta.DettagliProdotto,
                inizioAsta: asta.DettagliAsta.Inizio,
                fineAsta: asta.DettagliAsta.Fine,
                tipoAsta: asta.DettagliAsta.Tipo,
                offertaVincente: asta.DettagliAsta.Offerte[asta.DettagliAsta.Offerte.length-1]
            };
        }
    });
    res.status(200).json(aste);
});

module.exports = router;