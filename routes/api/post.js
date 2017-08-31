const express = require('express'),
	router = express.Router();

const api = require( "../../lib/api" ),
	mongo = require( "../../lib/mongo"),
	config = require("../../config/config");

router.get('/', (req, res, next) => {
	res.json( {API: 'post'} );
});


router.post('/', (req, res) => {
	if( api.requestCheckWithResponse( req.body, res ) ) {
		console.log("api/post", req.body);

		mongo.upsert(
			config.mongo.collections.post,
			{ randomUuid: req.body.randomUuid, performanceId: req.body.payload.performanceId },
			mongo.prepareUpsert( req.body.payload, req.body.requestDateTime),
			( error, data ) => {
				if( !error ) {
					let response = api.prepareResponse( req.body.requestId );

					response.payload = {
						updated : true
					};

					res.json( response );
				}
			}
		)
	}
});

/* Always:
	request: {
		appOs: OS System
		appVersion: current app version,

		key: server generate uuid,

		randomUuid: app generate uuid,

		requestId: request generated uuid,
		requestDateTime: (new Date()).toISOString(),

		payload: {...}
	};
	result: {
		resultUuid: must match request-uuid,
	};

*/

module.exports = router;
