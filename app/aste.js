const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
var fs = require('fs');
const Utente = require('./models/utente');

function getCategorieRichieste(eCategorie){
    categorie = ["Collezionismo", "Vinile", "Arte", "Antico"];
    if(eCategorie){
        if(Array.isArray(eCategorie)){
            for(let i = 0; i < eCategorie.length; i++){
                index = categorie.indexOf(eCategorie[i]);
                categorie.splice(index, 1);
            }
        }
        else{
            index = categorie.indexOf(eCategorie);
            categorie.splice(index, 1);
        }
    }
    return categorie;
}

function getTipiRichiesti(eTipi){
    tipi = [0,1];
    if(eTipi){
        for(let i = 0; i < eTipi.length; i++){
            index = tipi.indexOf(parseInt(eTipi[i]));
            tipi.splice(index, 1);
        }
    }
    return tipi;
}

router.get('', async function(req, res){
    let tipiRichiesti = getTipiRichiesti(req.query.eTipi)
    let categorieRichieste = getCategorieRichieste(req.query.eCategorie);
    let prezzoMassimo = (req.query.ePrezzo) ? req.query.ePrezzo : 100000;

    let aste;
    if(req.query.orderBy === "1"){
        if(req.query.order === "asc"){
            aste = await Asta.find({'DettagliAsta.Fine':{$gte: new Date()},'DettagliAsta.Inizio':{$lte: new Date()}, 'DettagliAsta.Offerte': {$ne: []}, 'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.Offerte.0': 'asc'}).exec();
            let aste2 = await Asta.find({'DettagliAsta.Fine':{$gte: new Date()},'DettagliAsta.Inizio':{$lte: new Date()}, 'DettagliAsta.Offerte': [], 'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.PrezzoMinimo': 'asc'}).exec();
            let j = 0;
            let i = 0;
            for(i; i < aste.length && j < aste2.length; i++){
                if(aste2[j].DettagliAsta.PrezzoMinimo < aste[i].DettagliAsta.Offerte[0]){
                    aste.splice(i,0,aste2[j]);
                    j++;
                }
            }
            for(j; j < aste2.length; j++){
                aste[i] = aste2[j];
                i++;
            }
            aste = aste.concat(await Asta.find({'DettagliAsta.Fine':{$gt: new Date()},'DettagliAsta.Inizio':{$gt: new Date()}, 'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.PrezzoMinimo': 'asc'}).exec());
        }
        else{
            aste = await Asta.find({'DettagliAsta.Fine':{$gte: new Date()},'DettagliAsta.Inizio':{$lte: new Date()}, 'DettagliAsta.Offerte': {$ne: []}, 'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.Offerte.0': 'desc'}).exec();
            let aste2 = await Asta.find({'DettagliAsta.Fine':{$gte: new Date()},'DettagliAsta.Inizio':{$lte: new Date()}, 'DettagliAsta.Offerte': [], 'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.PrezzoMinimo': 'desc'}).exec();
            let j = 0;
            let i = 0;
            for(i; i < aste.length && j < aste2.length; i++){
                if(aste2[j].DettagliAsta.PrezzoMinimo > aste[i].DettagliAsta.Offerte[0]){
                    aste.splice(i,0,aste2[j]);
                    j++;
                }
            }
            for(j; j < aste2.length; j++){
                aste[i] = aste2[j];
                i++;
            }
            aste = aste.concat(await Asta.find({'DettagliAsta.Fine':{$gt: new Date()},'DettagliAsta.Inizio':{$gt: new Date()}, 'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.PrezzoMinimo': 'desc'}).exec());
        }
    }
    else if(req.query.orderBy === "2"){
        aste = (req.query.order === "asc") ? await Asta.find({'DettagliAsta.Fine':{$gte: new Date()},'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliProdotto.Nome': 'asc'}).exec() : await Asta.find({'DettagliAsta.Fine':{$gte: new Date()},'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliProdotto.Nome': 'desc'}).exec();
    }
    else{
        if(req.query.order === "asc" || req.query.order == null){
            aste = await Asta.find({'DettagliAsta.Fine':{$gte: new Date()},'DettagliAsta.Inizio':{$lte: new Date()},'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.Fine': 'asc'}).exec();
            aste = aste.concat(await Asta.find({'DettagliAsta.Fine':{$gt: new Date()},'DettagliAsta.Inizio':{$gt: new Date()}, 'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.Inizio': 'asc'}).exec());
        }
        else{
            aste = await Asta.find({'DettagliAsta.Fine':{$gt: new Date()},'DettagliAsta.Inizio':{$gt: new Date()}, 'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.Inizio': 'desc'}).exec();
            aste = aste.concat(await Asta.find({'DettagliAsta.Fine':{$gte: new Date()},'DettagliAsta.Inizio':{$lte: new Date()}, 'DettagliAsta.Tipo': {$in: tipiRichiesti}, 'DettagliProdotto.Categorie': {$in: categorieRichieste}, $or: [{'DettagliAsta.PrezzoMinimo': {$lte: prezzoMassimo}},{'DettagliAsta.PrezzoMinimo': null}]}).sort({'DettagliAsta.Fine': 'desc'}).exec());

        }
    }
    
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

router.post('', async function(req, res) {
	let now = new Date();

    let inizio = new Date(req.body.inizio).getTime();
    let fine = new Date(req.body.fine).getTime();

	if (inizio < now || fine < inizio){
		return res.status(400).json({success: false, message:"Attributo Inizio o Fine non valido"});
	}
    else if (req.body.prezzoMinimo != "null" && isNaN(req.body.prezzoMinimo)){
        return res.status(400).json({success: false, message:"Attributo prezzo minimo non valido"});
    }

    for(let i = 0; i < req.files.length; i++){
        if(req.files[i].mimetype != "image/jpeg" && req.files[i].mimetype != "image/png"){
            return res.status(400).json({success: false, message:"Estensione immagine inserita non valida"});
        }
    }

    let nomeFoto = [];
    //Salvo le immagini inserite dall'utente
    for(let i = 0; i < req.files.length; i++){
        nomeFoto[i] = now.getTime() + "_" + i + ".jpeg";
        fs.writeFile("./static/fotoProdotti/"+nomeFoto[i],Buffer.from(req.files[i].buffer), function(err){
            if(err){
                return console.log(err)
            }
        })
    }

    const newAsta = new Asta({
		DettagliProdotto:{Nome:req.body.nome, Categorie:req.body.categoria,Descrizione:req.body.descrizione,Foto:nomeFoto},
		DettagliAsta:{Inizio:req.body.inizio,Fine:req.body.fine,Tipo:req.body.tipo,PrezzoMinimo:(req.body.prezzoMinimo != "null") ? req.body.prezzoMinimo : null,Venditore:req.headers["id-account"],Offerte:[],Offerenti:[]},
		Preferenze: [req.headers["id-account"]]
	});

    id = await newAsta.save();

    await Utente.updateOne({
        _id: req.headers["id-account"]
    },
    {
        $push:{AstePreferite: id._id}
    });

	return res.status(200).json({
		success: true,
		message: 'Nuova asta aggiunta correttamente',
		self: "api/v1/aste/" + newAsta._id
	});
});

router.put('/:id', async function(req, res) {
    let asta = await Asta.findById(req.params.id).catch((err)=>{console.log(err);});

    if(!asta) 
        return res.status(404).json({ success: false, message: 'Asta non trovata'});

    if(req.query.put == 'fine') {
        if(asta.DettagliAsta.Venditore == req.headers['id-account']) {
            asta.DettagliAsta.Fine = new Date();
            await asta.save();
            code = 200;
            success = true;
            message = 'Asta conclusa correttamente';
        } else {
            code = 400;
            success = false;
            message = 'Quest\'asta non ti appartiene';
        }
    } else {
        if(asta.DettagliAsta.Venditore == req.headers["id-account"])
            return res.status(400).json({ success: false, message: "Non puoi offrire per un'asta creata da te stesso"});

        let dateTimeAttuale = new Date().getTime();

        if(asta.DettagliAsta.Inizio > dateTimeAttuale || asta.DettagliAsta.Fine < dateTimeAttuale)
            return res.status(400).json({ success: false, message: 'Non puoi offrire per questa asta'});

        if((asta.DettagliAsta.Tipo == 1 && asta.DettagliAsta.Offerte.length != 0 && req.body.prezzo <= asta.DettagliAsta.Offerte[0]) || (asta.DettagliAsta.PrezzoMinimo && req.body.prezzo < asta.DettagliAsta.PrezzoMinimo))
            return res.status(400).json({ success: false, message: 'Prezzo troppo basso'});

        if(isNaN(req.body.prezzo) || req.body.prezzo==null)
            return res.status(400).json({ success: false, message: 'Prezzo non valido'});

        if(asta.DettagliAsta.Tipo == 0 && asta.DettagliAsta.Offerenti.indexOf(req.headers["id-account"]) > -1)
            return res.status(400).json({ success: false, message: "L'asta ?? a busta chiusa ed ?? presente gi?? una tua offerta"});

        let pos = 0;

        if(asta.DettagliAsta.Tipo == 0)
            while(asta.DettagliAsta.Offerte[pos] > req.body.prezzo && pos < asta.DettagliAsta.Offerte.length)
                pos++;

        await Asta.updateOne({
            _id: req.params.id
        }, {
            $push: {
                'DettagliAsta.Offerte': {
                    $each: [parseFloat(req.body.prezzo)], $position:pos
                },
                'DettagliAsta.Offerenti': {
                    $each: [req.headers["id-account"]],$position:pos
                }
            }
        });

        return res.status(200).json({ message: 'Nuova offerta avvenuta con successo', success: true, self: "/api/v1/aste/"+req.params.id });
    }

    return res.status(code).json({
        success: success,
        message: message
    });
});


router.get('/:id', async function(req, res){
    let asta = await Asta.findById(req.params.id).catch((err)=>{console.log(err);});

    if(!asta)
        return res.status(404).json({ success: false, message: 'Asta non trovata'});
  
    if(req.query.get == 'valori') {
        asta = await Asta.findById(req.params.id).select('DettagliAsta.Fine DettagliAsta.Offerte DettagliAsta.Offerenti').slice('DettagliAsta.Offerte', 1).slice('DettagliAsta.Offerenti', 1).lean();
        return res.status(200).json({
            fine: asta.DettagliAsta.Fine,
            offerta: asta.DettagliAsta.Offerte,
            offerente: asta.DettagliAsta.Offerenti
        });
    } else if(req.query.get == 'fine') {
        asta = await Asta.findById(req.params.id).select('DettagliAsta.Fine').lean();

        return res.status(200).json({
            fine: asta.DettagliAsta.Fine,
        });
    } else {
        let venditore = await Utente.findOne({_id: asta.DettagliAsta.Venditore}, { Username: 1}).exec();
    
        return res.status(200).json({
            success:true,
            self: '/api/v1/aste/' + asta._id,
            idAsta: asta._id,
            dettagliProdotto: asta.DettagliProdotto,
            inizioAsta: asta.DettagliAsta.Inizio,
            fineAsta: asta.DettagliAsta.Fine,
            tipoAsta: asta.DettagliAsta.Tipo,
            prezzoMinimo: asta.DettagliAsta.PrezzoMinimo,
            offerteAsta: asta.DettagliAsta.Offerte,
            offerentiAsta: asta.DettagliAsta.Offerenti,
            venditoreAsta: venditore,
            preferenze: (typeof asta.Preferenze === 'undefined' || asta.Preferenze.length == 0) ? null : asta.Preferenze
        });
    }
});

module.exports = router;