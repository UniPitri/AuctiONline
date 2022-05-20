var express = require('express');
var app = express();
const mongoose = require('mongoose');

const autenticazione = require('./autenticazione.js');
<<<<<<< HEAD
const tokenChecker = require('./tokenChecker.js');

const aste = require('./aste.js')
=======
const registrazione = require('./registrazione.js');
>>>>>>> register

//Configurazione parsing middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Definisco visibilità esterna
app.use(express.static('../static'))

<<<<<<< HEAD
/**
 * Serve front-end static files
 */
 app.use('/', express.static(process.env.FRONTEND || 'static'));
 // If process.env.FRONTEND folder does not contain index.html then use the one from static
 app.use('/', express.static('static')); // expose also this folder

=======
>>>>>>> register

app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url);
    next();
})


app.use('/api/v1/autenticazione', autenticazione);
<<<<<<< HEAD

//app.use('/api/v1/aste',tokenChecker);

app.use('/api/v1/aste', aste);
=======
app.use('/api/v1/registrazione', registrazione);
//Get nel caso '/'
/* app.get('/', function(req, res){
    res.sendFile(__dirname+'/frontend/prova.html')
}); */
>>>>>>> register

//Configurazione mongoose e avvio server
app.locals.db = mongoose.connect(process.env.DB_URL,
    {useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
    console.log("Connected to Database");

    app.listen(3000, function() {
    console.log('Server running on port ', 3000);
    });
<<<<<<< HEAD
});
=======
});


/*app.listen(3000, function() {
    console.log('Server running on port ', 3000);
    });*/

/**
 * Serve front-end static files
 */
app.use('/', express.static(process.env.FRONTEND || 'static'));
// If process.env.FRONTEND folder does not contain index.html then use the one from static
app.use('/', express.static('static')); // expose also this folder
>>>>>>> register
