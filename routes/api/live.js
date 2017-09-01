const express = require('express'),
	router = express.Router();

const api = require( "../../lib/api" ),
	mongo = require( "../../lib/mongo"),
	config = require("../../config/config");

router.get('/', (req, res, next) => {
	res.json( {API: 'live'} );
});

router.post('/', (req, res, next) => {
	if( api.requestCheckWithResponse( req.body, next ) ) {
		console.log("POST api/live/");

		mongo.upsert( config.mongo.collections.live,
			{ randomUuid: req.body.randomUuid, feedbackId: req.body.payload.feedbackId },
			mongo.prepareUpsert( req.body.payload, req.body.requestDateTime),
				( error, data ) => {
					if( error ) {
						api.error( "Server database error", 500, next );
					}
					else {
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
		keyUuid: server generate uuid,
		randomUuid: app generate uuid,
		requestUuid: request generated uuid,
		payload: ...
	};
	result: {
		resultUuid: must match request-uuid,
	};

*/module.exports = router;
