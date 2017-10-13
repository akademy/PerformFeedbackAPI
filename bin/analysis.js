const mongo = require( "../lib/mongo"),
	config = require("../config/config");

const async = require('async');

// Version releases:
// 1.0.1: (Android) 2017-09-10
// 1.0.2 : (iOS) 2017-09-18, (Android) 2017-09-16?
// 1.0.3 : (iOS) 2017-09-25, (Android) 2017-09-22

/*
// Pre useful data.
{
	'createdTime' : { '$gt' : '2017-09-15' }, // restrict debugging data
	'$or' : [ // Select only those with some data returned
		{ 'dateOfBirth' : { '$ne' : null } },
		{ 'musicTraining' : { '$ne' : null }},
		{ 'musicField' : { '$ne' : null }},
		{ 'mathTraining' : { '$ne' : null }},
		{ 'mathField' : { '$ne' : null }},
		{ 'education' : { '$ne' : null }},
		{ 'musicListen' : { '$ne' : null }}
	]
}
*/


(function() {
	"use strict";

	mongo.select(config.mongo.collections.pre, {},
		(error, pres) => {
			if( error ) { api.error( "There was a server database error", 500, next ); }
			else {
				pres.forEach( (pre) => {
					// Do a bit of cleaning.
					delete pre.syncStatus;
					delete pre.postingProfile;
				});

				mongo.insertMany( config.mongo.collections.combined, pres, () => {
					console.log("Done Pre");

					mongo.select(config.mongo.collections.live, {},
						(error, lives) => {

							var livesCombined = {};

							for( var i=0, z=lives.length;i<z; i++) {
								var live = lives[i],
									randomUuid = live.randomUuid;

								delete live.syncStatus;
								delete live.posting;
								delete live._id;
								delete live.randomUuid;
								delete live.feedbackId;

								if( !livesCombined[randomUuid] ) {
									livesCombined[randomUuid] = []
								}

								livesCombined[randomUuid].push( live )
							}

							var randomUuids = Object.keys( livesCombined );
							async.each( randomUuids, ( randomUuid, doneAnEach ) => {
								mongo.update( config.mongo.collections.combined,
									{ 'randomUuid':randomUuid},
									{ '$set' : { "lives" : livesCombined[randomUuid] } },
									() => {doneAnEach();}
								)
							},
								() => {
									console.log("Done Live");
								}
							)
						});
				})
			}
		})

})();
