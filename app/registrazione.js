
const express = require('express');
const router = express.Router();
const Utente = require('./models/utente'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

router.post('', async function(req, res) {
	
    // find another user using email

	let presente = await Utente.findOne({
		Mail: req.body.email
	}, {Salt: 0, AstePreferite: 0 }).exec();
    
	if (presente != null){
		return res.status(409).json({ success: false, message: 'Email gia in utilizzo' });
	}

    // find another user using username
    let presente2 = await Utente.findOne({
        Username: req.body.username
    }, {Salt: 0, AstePreferite: 0 }).exec();
    
    if (presente2 != null){
        return res.status(409).json({ success: false, message: 'Username gia in utilizzo' });
	}

    const newUser = new Utente({Mail: req.body.email, Username: req.body.username, Password: req.body.password});
	console.log(newUser);
    newUser.save();

    var payload = {
		email: newUser.Mail,
		id: newUser._id,
        username: newUser.Username	
	}
	var options = {
		expiresIn: 86400 // expires in 24 hours
	}
	var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

	return res.status(201).json({
		success: true,
		message: 'Nuovo Utente registrato con successo',
		token: token,
		email: newUser.Mail,
		id: newUser._id,
		self: "api/v1/" + newUser._id
	});

    //res.location("/api/v1/autenticazione.js/" + newUser.email).status(201).send();
	
});

module.exports = router;