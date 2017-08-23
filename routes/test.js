const express = require('express'),
	router = express.Router();

router.get('/', (req, res, next) => {
	res.send(
		`
		<html><body>
			<hr/>
			
			<ul>
				<li><a href="/api/pre">GET api/pre</a></li>
			</ul>
			<hr/>
			
			<ul>
				<li><a href="/api/live">GET api/live</a></li>
			</ul>
			<hr/>
			
			<ul>
				<li><a href="/api/post">GET api/post</a></li>
			</ul>
			<hr/>
			
			<ul>
				<li><a href="/test/q">GET test/q</a></li>
				<li><form action="/test/q" method="post"><input name="A" type="hidden"/><input type="submit" value="POST test/q"/></form></li>
			</ul>
			<hr/>
			
		</body></html>
		`
	);
});

router.get('/q', (req, res, next) => {
	res.json( { easter : { egg: "Q Why did the API go to sleep?" } } );
});
router.post('/q', (req, res, next) => {
	let data;
	if( req.body.A !== undefined ) {
		data = {easter: {egg: "A It needed some REST."}};
	}
	else {
		data = { Aye : "?!" };
	}
	res.send(data);
});

router.get('/count', (req, res, next) => {
	res.json( { count : 222 } );
});

module.exports = router;
