const express = require('express'),
	router = express.Router();

router.get('/', (req, res, next) => {
	res.send(
		`<html><body>...</body></html>`
	);
});

module.exports = router;
