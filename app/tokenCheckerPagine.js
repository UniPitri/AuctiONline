const jwt = require('jsonwebtoken');
const tokenChecker = function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	
	if (!token) {
		return res.redirect('/');
	}

	jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded) {			
		if (err) {
			return res.redirect('/');	
		} else {
			req.loggedUser = decoded;
			next();
		}
	});
};

module.exports = tokenChecker