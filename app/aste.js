const express = require('express');
const router = express.Router();
const Asta = require('./models/asta');
var fs = require('fs');

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

router.post('', async function(req, res) {
	let now = new Date();

    let inizio = new Date(req.body.inizio).getTime();
    let fine = new Date(req.body.fine).getTime();

	if (inizio < now || fine < inizio){
		return res.status(400).json({success: false, message:"Attributo Inizio o Fine non valido"});
	}
    else if (req.body.prezzoMinimo != "null" && isNaN(req.body.prezzoMinimo)){
        return res.status(400).json({success: false, message:"Attributo prezzoMinimo non valido"});
    }

    for(let i = 0; i < req.files.length; i++){
        if(req.files[i].mimetype != "image/jpeg" || req.files[i].mimetype != "image/png"){
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
		Preferenze: []
	});

    newAsta.save();

	return res.status(201).json({
		success: true,
		message: 'Nuova asta aggiunta correttamente',
		self: "api/v1/" + newAsta._id
	});
});

module.exports = router;