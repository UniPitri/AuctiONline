const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
const Utente = require('./models/utente');

router.post('', async function(req, res){

     let occorrenza = await Utente.findOne({
		_id: req.body.userID,
        AstePreferite : req.body.idAsta
	}, { Salt: 0, AstePreferite: 0 }).exec();

     if(occorrenza != null){
        return res.status(200).json({ 
            success: 1,
            message: 'asta è preferita' });
     }else{
         
        return res.status(200).json({ 
            success: 0,
            message: 'asta non preferita' });
    }
});

module.exports = router;