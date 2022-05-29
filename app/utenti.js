const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
const Utente = require('./models/utente');

router.get('/:id/aste', async function(req, res){
    if(req.query.get == "vinte"){
        //Voglio aste vinte
        let aste;
        if(req.query.orderBy === "1"){
            aste = (req.query.order === "asc") ? await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).sort({'DettagliAsta.Fine': 'asc'}).exec() : await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).sort({'DettagliAsta.Fine': 'desc'}).exec();
        }
        else if(req.query.orderBy === "2"){
            aste = (req.query.order === "asc") ? await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).sort({'DettagliProdotto.Nome': 'asc'}).exec() : await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).sort({'DettagliProdotto.Nome': 'desc'}).exec();
        }
        else if(req.query.orderBy === "3"){
            aste = (req.query.order === "asc") ? await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).sort({'DettagliAsta.Offerte.0': 'asc'}).exec() : await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).sort({'DettagliAsta.Offerte.0': 'desc'}).exec();
        }
        else{
            aste = (req.query.order === "desc") ? await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).sort({'DettagliAsta.Inizio': 'desc'}).exec() : await Asta.find({'DettagliAsta.Offerenti.0':req.params.id,'DettagliAsta.Fine':{$lte: new Date()}}).sort({'DettagliAsta.Inizio': 'asc'}).exec();
        }
    
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
    }
    else{
        //Voglio aste preferite
        let utente = await Utente.findById(req.params.id, 'AstePreferite').populate('AstePreferite').exec();
        astePreferite = utente.AstePreferite;
        
        /* if(req.query.orderBy === "1"){
            if(req.query.order === "asc"){
            }
            else{                
            }
        }
        else if(req.query.orderBy === "2"){
            aste = (req.query.order === "asc") ? await Asta.find({'DettagliAsta.Fine':{$gte: new Date()}}).sort({'DettagliProdotto.Nome': 'asc'}).exec() : await Asta.find({'DettagliAsta.Fine':{$gte: new Date()}}).sort({'DettagliProdotto.Nome': 'desc'}).exec();
        }
        else{
            if(req.query.order === "asc" || req.query.order == null){   
            }
            else{  
            }
        } */

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
    }
});

module.exports = router;