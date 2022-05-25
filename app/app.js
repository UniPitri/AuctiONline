var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer()
const mongoose = require('mongoose');
const autenticazione = require('./autenticazione.js');
const registrazione = require('./registrazione.js');
const astePreferite = require('./astePreferite.js');
const tokenChecker = require('./tokenChecker.js');
const tokenCheckerPagine = require('./tokenCheckerPagine.js')
const aste = require('./aste.js');

//Configurazione parsing middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url);
    next();
})

app.use('/tueAste.html', tokenCheckerPagine);
app.use('/creazioneAsta.html', tokenCheckerPagine);

app.use('/api/v1/autenticazione', autenticazione);
app.use('/api/v1/registrazione', registrazione);

app.post('/api/v1/aste', tokenChecker);
app.put('/api/v1/aste', tokenChecker);
app.use('/api/v1/astePreferite', tokenChecker);

app.use('/api/v1/aste', upload.array('foto',5),aste);
app.use('/api/v1/astePreferite', astePreferite);

app.get('/api/v2/utenti/:id/aste', async (req, res) => {
    const Utente = require('./models/utente');
    let utente = await Utente.findById(req.params.id, 'AstePreferite').populate('AstePreferite').exec();
    astePreferite2 = utente.AstePreferite;
    //console.log(astePreferite2);
    astePreferite2 = astePreferite2.map( (astaPreferita) => {
        return {
            self: '/api/v1/aste/' + astaPreferita._id,
            idAsta: astaPreferita._id,
            dettagliProdotto: astaPreferita.DettagliProdotto,
            dettagliAsta: astaPreferita.DettagliAsta,
            preferenze: (typeof astaPreferita.Preferenze === 'undefined' || astaPreferita.Preferenze.length == 0) ? null : astaPreferita.Preferenze
        };
    });
    res.status(200).json(astePreferite2);
});

/**
 * Serve front-end static files
 */
 app.use('/', express.static(process.env.FRONTEND || 'static'));
 // If process.env.FRONTEND folder does not contain index.html then use the one from static
 app.use('/', express.static('static')); // expose also this folder

//Configurazione mongoose e avvio server
app.locals.db = mongoose.connect(process.env.DB_URL,
    {useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
    console.log("Connected to Database");

    app.listen(3000, function() {
    console.log('Server running on port ', 3000);
    });
});