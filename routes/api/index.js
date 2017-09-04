const express = require('express'),
	router = express.Router();

const api = require( "../../lib/api" ),
	mongo = require( "../../lib/mongo"),
	config = require("../../config/config");

const pre = require('./pre'),
		live = require('./live'),
		post = require('./post');

router.use( '/pre', pre );
router.use( '/live', live );
router.use( '/post', post );

/*router.get('/', (req, res, next) => {
	res.json( {API: ''} );
});*/

router.get('/', (req, res, next) => {
	mongo.select( (error, data ) => {
		res.send( `
			<html><body>
				${data}
			</body></html>
		` );
	});
});

module.exports = router;
