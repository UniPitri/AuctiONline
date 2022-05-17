const express = require('express');
const router = express.Router();
const Utente = require('./models/utente'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens


// ---------------------------------------------------------
// route to authenticate and get a new token
// ---------------------------------------------------------
router.post('', async function(req, res) {
	
	// find the user
	let user = await Utente.findOne({
		Mail: req.body.email
	}, { /*_id: 1, Username: 1, Password: 1, Mail: 1*/ Salt: 0, AstePreferite: 0 }).exec();
    
	// user not found or wrong password
	if (!user || user.Password != req.body.password)
		res.json({ success: false, message: 'Autenticazione fallita. Utente o password errati' });
	
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

	res.json({
		success: true,
		message: 'Enjoy your token!',
		token: token,
		email: user.Mail,
		id: user._id,
		self: "api/v1/" + user._id
	});

});



module.exports = router;