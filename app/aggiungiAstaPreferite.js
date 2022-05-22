const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
const Utente = require('./models/utente');

router.post('', async function(req, res){

    /*
    let occorrenza = await Utente.findOne(
        { _id: req.body.userID,
        AstePreferite : req.body.idAsta }
     )
     if(occorrenza != null){
        return res.status(401).json({ 
            success: 0,
            message: 'asta gia presente' });
     }else{}
      */
     console.log(req.body.userID);
     console.log(req.body.idAsta);
     

    await Utente.updateOne(
        { _id: req.body.userID },
        { $push : {AstePreferite : req.body.idAsta} }
     )
    
     return res.status(200).json({ 
        self: '/api/v1/aste/' + req.body.idAsta,
        success: 1,
        message: 'asta aggiunta' });
           
     
});

module.exports = router;