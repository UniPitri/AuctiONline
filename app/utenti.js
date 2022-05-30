const express = require('express');
const router = express.Router();
const Utente = require('./models/utente');
    
router.get('/:id/aste/:get', async (req, res) => {
    if(req.params.get == 'valide') {
        let utente = await Utente.findById(req.params.id, 'AstePreferite').populate({ path: 'AstePreferite', match: { 'DettagliAsta.Fine': { $gt: new Date() }}}).exec();
        astePreferite = utente.AstePreferite;
        console.log(utente);

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
    } else {
        res.status(400).json({ message: 'Errore 0: Parametro invalido!' });
    }
});

router.get('/:id/aste', async (req, res) => {
    let utente = await Utente.findById(req.params.id, 'AstePreferite').populate('AstePreferite').exec();
    astePreferite = utente.AstePreferite;
    //console.log(astePreferite);

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