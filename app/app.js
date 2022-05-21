var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer()
const mongoose = require('mongoose');

const autenticazione = require('./autenticazione.js');
const registrazione = require('./registrazione.js');

const tokenChecker = require('./tokenChecker.js');

const aste = require('./aste.js');

//Configurazione parsing middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/**
 * Serve front-end static files
 */
 app.use('/', express.static(process.env.FRONTEND || 'static'));
 // If process.env.FRONTEND folder does not contain index.html then use the one from static
 app.use('/', express.static('static')); // expose also this folder


app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url);
    next();
})

app.use('/api/v1/autenticazione', autenticazione);
app.use('/api/v1/registrazione', registrazione);

app.post('/api/v1/aste', tokenChecker)

app.use('/api/v1/aste', upload.array('foto',5),aste);


//Configurazione mongoose e avvio server
app.locals.db = mongoose.connect(process.env.DB_URL,
    {useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
    console.log("Connected to Database");

    app.listen(3000, function() {
    console.log('Server running on port ', 3000);
    });
});