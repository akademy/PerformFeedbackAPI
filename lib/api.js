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
		requestDateTime: (new Date()).toISOString(),

		payload: {...}
	};
	result: {
		resultId: must match requestId,

		payload: {...}
	};
	*/

	error: (text, status, handler ) => {
		const error = new Error( 'Simon says "'+ text + '. Sorry."' );
		error.status = status || 404;
		return handler(error);
	},
	error404: (handler) => {
		api.error( "Not found", 404, handler );
	},

	requestCheckWithResponse: (request, handler ) => {
		let error = api.requestCheck( request );
		if( error === "" ) {
			return true;
		}
		else {
			if( config.local.debug ) {
				console.error( "ERROR:API: ",error);
			}

			api.error404( handler );

			return false;
		}
	},

	requestCheck: ( request ) => {
		if (!request.hasOwnProperty("appOs") ||
			!request.hasOwnProperty("appVersion")||
			!request.hasOwnProperty("key") ||
			!request.hasOwnProperty("randomUuid") ||
			!request.hasOwnProperty("requestId") ||
			!request.hasOwnProperty("requestDateTime")) {
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

	prepareResponse : (requestId) => {
		let response = {
			responseId: requestId,
			payload: null
		};
		return response;
	},

	goodUuid : ( uuid ) => (
		// 123e4567-e89b-42d3-a456-426655440000
		// xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
		uuid.length === 36 && uuid[14] === '4' && uuid[8] === '-'
	)

};

module.exports = api;