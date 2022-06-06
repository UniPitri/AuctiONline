const express = require('express');
const router = express.Router();
const Utente = require('./models/utente');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

router.post('', async function(req, res) {
	// find the user
	let user = await Utente.findOne({
		Username: req.body.username
	}, { Salt: 0, AstePreferite: 0 }).exec();
	
	if (!user ||! await bcrypt.compare(req.body.password,user.Password)) {
		return res.status(401).json({ success: false, message: 'Autenticazione fallita. Utente o password errati' });
	} else {
		var payload = {
			email: user.Mail,
			id: user._id,
			username: user.Username	
		}
		var options = {
			expiresIn: 86400
		}
		var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

		return res.status(201).json({
			success: true,
			message: 'Enjoy your token!',
			token: token,
			email: user.Mail,
			id: user._id,
			self: "api/v1/utenti" + user._id
		});
	}
});

module.exports = router;