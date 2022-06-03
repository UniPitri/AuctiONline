const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
const Utente = require('./models/utente');

router.post('', async function(req, res){
    let asta = await Asta.findById(req.body.idAsta).catch((err)=>{console.log(err);});

    if(!asta) 
        return res.status(404).json({ success: false, message: 'Asta non trovata'});

    let occorrenza = await Utente.findOne({ _id: req.body.userID, AstePreferite: req.body.idAsta}, {_id:1}).exec();

    if(occorrenza != null){
        return res.status(409).json({success: false,message: 'Asta già presente tra i preferiti'});
    }

    await Utente.updateOne({ _id: req.body.userID },
        { $push : {AstePreferite : req.body.idAsta} });

    await Asta.updateOne({ _id: req.body.idAsta },
        { $push : {Preferenze : req.body.userID} });

    return res.status(201).json({ 
        success: true,
        message: 'Asta aggiunta ai preferiti',
        self: '/api/v1/aste/' + req.body.idAsta
    });
});

router.delete('', async function(req, res){
    let asta = await Asta.findById(req.body.idAsta).catch((err)=>{console.log(err);});

    if(!asta) 
        return res.status(404).json({ success: false, message: 'Asta non trovata'});

    let occorrenza = await Utente.findOne({ _id: req.body.userID, AstePreferite: req.body.idAsta}, {_id:1}).exec();

    if(occorrenza == null){
        return res.status(409).json({success: false,message: 'Asta non è tra i preferiti'});
    }

    await Utente.updateOne({ _id: req.body.userID },
        { $pull : {AstePreferite : req.body.idAsta} });

    await Asta.updateOne({ _id: req.body.idAsta },
        { $pull : {Preferenze : req.body.userID} });

    return res.status(201).json({ 
        success: true,
        message: 'Asta rimossa dai preferiti',
        self: '/api/v1/aste/' + req.body.idAsta
    });
});

module.exports = router;