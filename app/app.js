var express = require('express');
var app = express();
const mongoose = require('mongoose');

//Configurazione parsing middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Definisco visibilità esterna
app.use(express.static(__dirname+'/frontend'))


app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url)
    next()
})

//Get nel caso '/'
/* app.get('/', function(req, res){
    res.sendFile(__dirname+'/frontend/prova.html')
}); */

//Configurazione mongoose e avvio server
/* app.locals.db = mongoose.connect("mongodb+srv://Pitri:wf1PhiJyzLsqulb6@cluster0.00kap.mongodb.net/auctionline?retryWrites=true&w=majority",
    {useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
    console.log("Connected to Database");

    app.listen(3000, function() {
    console.log('Server running on port ', 3000);
    });
}); */

app.listen(3000, function() {
    console.log('Server running on port ', 3000);
    });