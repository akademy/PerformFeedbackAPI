const express = require('express'),
	router = express.Router();

router.get('/', (req, res, next) => {
	res.json( {API: 'live'} );
});

module.exports = router;
