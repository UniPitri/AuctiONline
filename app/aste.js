const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
var fs = require('fs');
const Utente = require('./models/utente');

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
		DettagliAsta:{Inizio:req.body.inizio,Fine:req.body.fine,Tipo:req.body.tipo,PrezzoMinimo:(req.body.prezzoMinimo != "null") ? req.body.prezzoMinimo : null,PrezzoAttuale:null,VincitoreAttuale:null},
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
		self: "api/v1/" + newAsta._id
	});
});

router.put('/:id', async function(req, res) {
    let asta = await Asta.findById(req.params.id).catch((err)=>{console.log(err);});

    if(!asta) 
        return res.status(404).json({ success: false, message: 'Asta non trovata'});

    if(req.body.prezzo < asta.DettagliAsta.PrezzoAttuale)
        return res.status(400).json({ success: false, message: 'Prezzo troppo basso'});

    if(isNaN(req.body.prezzo) || req.body.prezzo==null){
        return res.status(400).json({ success: false, message: 'Prezzo non valido'});
    }

    asta.DettagliAsta.PrezzoAttuale = req.body.prezzo;
    await asta.save();

    return res.status(200).json({ message: 'Nuova offerta avvenuta con successo', success: true });
});

router.get('/:id', async function(req, res){
    let asta = await Asta.findById(req.params.id).catch((err)=>{console.log(err);});
    
    if(!asta){
        return res.status(404).json({ success: false, message: 'Asta non trovata'});
    }

    return res.status(200).json({
        self: '/api/v1/aste/' + asta._id,
        idAsta: asta._id,
        dettagliProdotto: asta.DettagliProdotto,
        dettagliAsta: asta.DettagliAsta,
        preferenze: (typeof asta.Preferenze === 'undefined' || asta.Preferenze.length == 0) ? null : asta.Preferenze
    });
});

module.exports = router;