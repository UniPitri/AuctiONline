const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');

router.get('', async function(req, res){
    let aste = await Asta.find({'DettagliAsta.Fine':{$gte: new Date()}}).exec();
    aste = aste.map( (asta) => {
        return {
            self: '/api/v1/aste/' + asta._id,
            idAsta: asta._id,
            dettagliProdotto: asta.DettagliProdotto,
            dettagliAsta: asta.DettagliAsta,
            preferenze: (typeof asta.Preferenze === 'undefined' || asta.Preferenze.length == 0) ? null : asta.Preferenze
        };
    });
    res.status(200).json(aste);
});

module.exports = router;