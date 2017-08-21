const express = require('express'),
	router = express.Router();

const pre = require('./pre');
const live = require('./live');
const post = require('./post');

router.get('/', (req, res, next) => {
	res.send( {API: ''} );
});

router.use( '/pre', pre );
router.use( '/live', live );
router.use( '/post', post );

module.exports = router;
