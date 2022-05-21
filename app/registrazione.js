
const express = require('express');
const router = express.Router();
const Utente = require('./models/utente');
const jwt = require('jsonwebtoken');
router.post('', async function(req, res) {

	let presente = await Utente.findOne({
		Mail: req.body.email
	}, {Salt: 0, AstePreferite: 0 }).exec();
    
	if (presente != null){
		return res.status(409).json({ success: false, message: 'Email già in utilizzo' });
	}

    let presente2 = await Utente.findOne({
        Username: req.body.username
    }, {Salt: 0, AstePreferite: 0 }).exec();
    
    if (presente2 != null){
        return res.status(409).json({ success: false, message: 'Username già in utilizzo' });
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
		expiresIn: 86400
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
});

module.exports = router;