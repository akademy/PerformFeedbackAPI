const express = require('express'),
	router = express.Router();

router.get('/', (req, res, next) => {
	res.send( { easter : {egg: "Q Why did the API go to sleep?"} } );
});
router.post('/', (req, res, next) => {
	if( req.param.hasOwnProperty("A") ) {
		res.send({easter: {egg: "It needed some REST."}});
	}
});

module.exports = router;
