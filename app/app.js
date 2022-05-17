var express = require('express');
var app = express();
const mongoose = require('mongoose');
const registrazione = require('./registrazione.js');
//const autenticazione = require('./backend/autenticazione.js');

//Configurazione parsing middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Definisco visibilità esterna
app.use(express.static(__dirname+'/frontend'))

app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url)
    next()
})

//app.use('/api/v1/autenticazione', autenticazione);
app.use('/api/v1/registrazione', registrazione);

//Get nel caso '/'
/* app.get('/', function(req, res){
    res.sendFile(__dirname+'/frontend/prova.html')
}); */

//Configurazione mongoose e avvio server
app.locals.db = mongoose.connect(process.env.DB_URL,
    {useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
    console.log("Connected to Database");

    app.listen(3000, function() {
    console.log('Server running on port ', 3000);
    });
});

/*app.listen(3000, function() {
    console.log('Server running on port ', 3000);
    });*/