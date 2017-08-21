const express = require('express'),
	router = express.Router();

router.get('/', (req, res, next) => {
	res.send(
		`
		<html><body>
			<ul>
				<li><a href="/test/q">GET q</a></li>
				<li><form action="/test/q" method="post"><input name="A" type="hidden"/><input type="submit" value="POST q"/></form></li>
			</ul>
		</body></html>
		`
	);
});

router.get('/q', (req, res, next) => {
	res.send( { easter : { egg: "Q Why did the API go to sleep?" } } );
});
router.post('/q', (req, res, next) => {
	if( req.body.A !== undefined ) {
		res.send({easter: {egg: "It needed some REST."}});
	}
	else {
		res.send({ Aye : "!" });
	}
});

module.exports = router;
