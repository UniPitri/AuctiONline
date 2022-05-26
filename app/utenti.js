const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
const Utente = require('./models/utente');

router.get('/:id/asteVinte', async function(req, res){
    let aste = await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).exec();

    aste = aste.map( (asta) => {
        return {
            self: '/api/v1/aste/' + asta._id,
            idAsta: asta._id,
            dettagliProdotto: asta.DettagliProdotto,
            inizioAsta: asta.DettagliAsta.Inizio,
            fineAsta: asta.DettagliAsta.Fine,
            tipoAsta: asta.DettagliAsta.Tipo,
            offertaVincente: asta.DettagliAsta.Offerte[0]
        };
    });
    res.status(200).json(aste);
});

module.exports = router;