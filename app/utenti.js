const express = require('express');
const router = express.Router();
const Utente = require('./models/utente');
    
router.get('/:id/aste', async (req, res) => {
    if(req.query.get == 'aperte') {
        utente = await Utente.findById(req.params.id, 'AstePreferite').populate({ 
            path: 'AstePreferite', 
            match: { 
                'DettagliAsta.Fine': { 
                    $gt: new Date() 
                }
            }
        }).exec();
    } else
        utente = await Utente.findById(req.params.id, 'AstePreferite').populate('AstePreferite').exec();

    astePreferite = utente.AstePreferite;
    //console.log(utente);

    astePreferite = astePreferite.map( (astaPreferita) => {
        return {
            self: '/api/v1/aste/' + astaPreferita._id,
            idAsta: astaPreferita._id,
            dettagliProdotto: astaPreferita.DettagliProdotto,
            dettagliAsta: astaPreferita.DettagliAsta,
            preferenze: (typeof astaPreferita.Preferenze === 'undefined' || astaPreferita.Preferenze.length == 0) ? null : astaPreferita.Preferenze
        };
    });

    res.status(200).json(astePreferite);
});

module.exports = router;