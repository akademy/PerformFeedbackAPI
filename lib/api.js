const config = require( "../config/config" ),
	uuid = require( "react-native-uuid" );

const api = {
	/*
	request: {
		appOs: OS System
		appVersion: current app version,
		key: server generate uuid,
		randomUuid: app generate uuid,
		requestId: request generated uuid,
	};
	result: {
		resultId: must match requestId,
	};
	*/

	requestRespond: ( request, response ) => {
		let error = api.requestCheck( request );
		if( error === "" ) {
			return true;
		}
		else {
			if( config.local.debug ) {
				response.json( { error } )
			}
			else {
				response.status(404);
				response.end();
			}

			return false;
		}
	},

	requestCheck: ( request ) => {
		if (!request.hasOwnProperty("appOs") ||
			!request.hasOwnProperty("appVersion")||
			!request.hasOwnProperty("key") ||
			!request.hasOwnProperty("randomUuid") ||
			!request.hasOwnProperty("requestId")) {
			return "Bad request format";
		}

		if (request.key !== config.local.api.lock) {
			return "Bad key";
		}

		if( !api.goodUuid(request.randomUuid) ) {
			return "Bad randomUuid";
		}
		if( !api.goodUuid(request.requestId) ) {
			return "Bad requestId";
		}

		//

		return "";
	},

	responseSetup : (requestId) => {
		let response = {
			resultId: requestId,
			payload: null
		};
		return response;
	},

	goodUuid : ( uuid ) => (
		// 123e4567-e89b-12d3-a456-426655440000
		// xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
		uuid[14] === '4' && uuid[8] === '-'
	)

};

module.exports = api;