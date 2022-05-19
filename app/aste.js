const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');

router.get('', async function(req, res){
    let aste = await Asta.find({'DettagliAsta.Fine':{$gte: new Date()}},{Preferite: 0}).exec();
    aste = aste.map( (asta) => {
        return {
            self: '/api/v1/aste/' + asta._id,
            dettagliProdotto: asta.DettagliProdotto,
            dettagliAsta: asta.DettagliAsta
        };
    });
    res.status(200).json(aste);
});

module.exports = router;