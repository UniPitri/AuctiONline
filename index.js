const app = require('./app/app.js');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

//Configurazione mongoose e avvio server
app.locals.db = mongoose.connect(process.env.DB_URL,
    {useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
    console.log("Connected to Database");

    app.listen(port, function() {
    console.log('Server running on port ', port);
    });
});