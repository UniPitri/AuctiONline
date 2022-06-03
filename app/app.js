var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer()

const tokenChecker = require('./tokenChecker.js');
const tokenCheckerPagine = require('./tokenCheckerPagine.js')

const autenticazione = require('./autenticazione.js');
const registrazione = require('./registrazione.js');
const astePreferite = require('./astePreferite.js');
const aste = require('./aste.js');
const utenti = require('./utenti.js');

//Configurazione parsing middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/* app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url);
    next();
}) */

app.use('/tueAste.html', tokenCheckerPagine);
app.use('/creazioneAsta.html', tokenCheckerPagine);
app.use('/articoliAcquistati.html', tokenCheckerPagine);

app.use('/api/v1/autenticazione', autenticazione);
app.use('/api/v1/registrazione', registrazione);

app.post('/api/v1/aste', tokenChecker);
app.put('/api/v1/aste/:id', tokenChecker);
app.use('/api/v1/astePreferite', tokenChecker);
app.use('/api/v1/utenti',tokenChecker);

app.use('/api/v1/aste', upload.array('foto',5),aste);
app.use('/api/v1/astePreferite', astePreferite);
app.use('/api/v1/utenti',utenti);

/**
 * Serve front-end static files
 */
 app.use('/', express.static(process.env.FRONTEND || 'static'));
 // If process.env.FRONTEND folder does not contain index.html then use the one from static
 app.use('/', express.static('static')); // expose also this folder

module.exports = app;