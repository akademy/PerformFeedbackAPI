const express = require('express'),
	router = express.Router();

router.get('/', (req, res, next) => {
	res.json( {API: 'post'} );
});

module.exports = router;
