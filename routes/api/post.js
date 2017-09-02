const express = require('express'),
	router = express.Router();

const api = require( "../../lib/api" ),
	mongo = require( "../../lib/mongo"),
	config = require("../../config/config");

router.get('/', (req, res, next) => {
	res.json( {API: 'post'} );
});


router.post('/', (req, res, next) => {
	if( api.requestCheckWithResponse( req.body, next ) ) {
		console.log("POST api/post/", "performanceId", req.body.payload.performanceId);

		mongo.upsert( config.mongo.collections.post,
			{ randomUuid: req.body.randomUuid, performanceId: req.body.payload.performanceId },
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
