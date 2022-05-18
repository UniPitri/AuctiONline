const express = require('express');
const router = express.Router();
const Utente = require('./models/utente'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens


// ---------------------------------------------------------
// route to authenticate and get a new token
// ---------------------------------------------------------
router.post('', async function(req, res) {
	console.log(req.body);
	// find the user
	let user = await Utente.findOne({
		Username: req.body.username
	}, { Salt: 0, AstePreferite: 0 }).exec();
    
	// user not found or wrong password
	if (!user || user.Password != req.body.password)
		return res.status(401).json({ success: false, message: 'Autenticazione fallita. Utente o password errati' });
	
	
	// if user is found and password is right create a token
	var payload = {
		email: user.Mail,
		id: user._id,
        username: user.Username	
	}
	var options = {
		expiresIn: 86400 // expires in 24 hours
	}
	var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

	return res.status(201).json({
		success: true,
		message: 'Enjoy your token!',
		token: token,
		email: user.Mail,
		id: user._id,
		self: "api/v1/" + user._id
	});

});

module.exports = router;