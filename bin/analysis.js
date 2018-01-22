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

/*
 // Filter out data not updated after performance. (i.e. remove test data)
 { "$and" : [
 {"modifiedTime" : { "$lt" : "2017-10-04" } },
 { "$or" : [
 { "lives" : {"$exists" : false} },
 { "lives.modifiedTime" : { "$lt" : "2017-10-04" } }
 ]},
 { "$or" : [
 { "post" : {"$exists" : false} },
 { "post.modifiedTime" : { "$lt" : "2017-10-04" } }
 ]}
 ]}
 */

(function() {
	"use strict";

	dropCollections( (error) => {
		//if (error) {return;} // ignore error, fails when collections don't exist...

		combineCollections( (error) => {
			if (error) { return; }

			duplicateCombined( (error) => {
				if (error) { return; }

				removeOld( (error) => {
					if (error) { return; }

					cleanLive( (error) => {
						if (error) { return; }

						removeNoLive((error) => {
							if (error) { return; }
						});
					});
				});
			});
		});
	});
})();

function cleanLive( complete ) {
	mongo.select(config.mongo.collections.reduced, {}, (error, datas) => {
		if (error) {
			console.error("Couldn't select. " + error);
			return;
		}

		async.eachLimit(datas, 4, (data, eachComplete) => {
				const lives = data.lives;
				let livesNew = [];

				let clientServerTimeCreated = Math.round( (new Date(data.createdTime)-new Date(data.createdTimeClient)) / 1000 );
				//let clientServerTimeModified = Math.round( (new Date(data.modifiedTime)-new Date(data.modifiedTimeClient)) / 1000 );
				//if( clientServerTimeCreated > 1 || clientServerTimeCreated < -1 ) {
				//	console.log(clientServerTimeCreated, clientServerTimeModified );
				//}

				if( lives ) {
					for (let i = 0, z = lives.length; i < z; i++) {

						let haveUsefulData = false;
						for (let j = 0, z = lives[i].data.length; j < z; j++) {
							if( lives[i].data[j].ty === undefined ) { // not "pre", "start" or "finish"
								haveUsefulData = true;
							}
						}

						if( haveUsefulData ) {
							if (lives[i].createdTime > '2017-10-04T19:15:00') { // About 5 mins before the performance

								livesNew.push(lives[i]);
							}
						}
					}
				}

				// Log
				if (livesNew.length > 1) {
					let message = "Too many. " + data._id + " ";

					for (let i = 0, z = livesNew.length; i < z; i++) {
						//message += livesNew[i].createdTime + " ";
						message += new Date(livesNew[i].data[0].ts).toISOString().replace("2017-10-04T","") + " ";
					}
					console.log(message + " " + clientServerTimeCreated);
				}
				//else if (livesNew.length === 0) {
				//	console.warn("None!");
				//}

				if( livesNew.length !== 0 ) {
					data.lives = livesNew;
				}
				else {
					delete data.lives;
				}
				if( livesNew.length === 1 ) {
					data.live = livesNew[0];
				}

				//mongo.insertMany( config.mongo.collections.reduced, [data], (error) => {
				//	eachComplete(error);
				//});
				eachComplete();
			},
			(error) => {
				console.log("Done live clean");
				complete(error);
			}
		)
	});
}

function removeNoLive( complete ) {
	const find =  { "lives" : { "$exists" : false } };

	mongo.remove(config.mongo.collections.reduced, find, (error) => {
		if (error) { console.error("Couldn't remove. " + error); return; }

		console.log("Removed no live from Reduced");

		complete(error);
	})
}
function removeOld( complete ) {
	const find = { "$and" : [
		{"modifiedTime" : { "$not" : { "$gt" : "2017-09-22" } } },
		{ "lives.modifiedTime" : { "$not" : { "$gt" : "2017-10-04" } } },
		{ "post.modifiedTime" : { "$not" : {"$gt" : "2017-10-04" } } }
	] };

	mongo.remove(config.mongo.collections.reduced, find, (error) => {
		if (error) { console.error("Couldn't remove. " + error); return; }

		console.log("Removed old from Reduced");

		complete(error);
	})
}

function duplicateCombined( complete ) {
	mongo.duplicateCollection(
		config.mongo.collections.combined,
		config.mongo.collections.reduced,
		(error) => {
			if (error) {
				console.error("Couldn't duplicate to reduced " + error);
				return;
			}

			console.log("Duplicated to Reduced");

			complete(error);
		});
}

function dropCollections( complete ) {
	"use strict";
	mongo.drop( config.mongo.collections.combined, (error) => {
		if( error ) { console.error( "Drop problem. " + error ); return complete(error);}
		mongo.drop( config.mongo.collections.reduced, (error) => {
			if (error) { console.error("Drop problem. " + error); return complete(error);}

			console.log("Dropped collections");
	 		return complete(error);
		});

	} );
}

function combineCollections( callbackComplete ) {
	"use strict";
	console.log("Combining collections...");

	mongo.select(config.mongo.collections.pre, {},
		(error, pres) => {
			if( error ) { console.error( "Select problem. " + error ); callbackComplete(error) }

			pres.forEach( (pre) => {
				// Do a bit of cleaning.
				delete pre.syncStatus;
				delete pre.postingProfile;
			});

			mongo.insertMany( config.mongo.collections.combined, pres, (error) => {
				if( error ) { console.error( "Insert many problem. " + error ); callbackComplete(error) }

				mongo.select(config.mongo.collections.live, {},
					(error, lives) => {
						if( error ) { console.error( "Select problem. " + error ); callbackComplete(error) }

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
								(error) => {
									doneAnEach(error);
								}
							)
						},
							(error) => {

								if( error ) { console.error( "Update problem. " + error ); callbackComplete(error) }

								mongo.insertMany( config.mongo.collections.combined, pres, () => {

									if( error ) { console.error( "Insert problem. " + error ); callbackComplete(error) }

									mongo.select(config.mongo.collections.post, {},
										(error, posts) => {

											if( error ) { console.error( "Select problem. " + error ); callbackComplete(error) }

											for( var i=0, z=posts.length;i<z; i++) {
												var post = posts[i],
													randomUuid = post.randomUuid;

												delete post.syncStatus;
												delete post.posting;
												delete post._id;
											}

											async.each( posts, ( post, doneAnEach ) => {
												var randomUuid = post.randomUuid;
												delete post.randomUuid;
												mongo.update( config.mongo.collections.combined,
													{ 'randomUuid':randomUuid },
													{ '$set' : { "post" : post } },
													(error) => {
														doneAnEach(error);
													}
												)
											}, (error) => {

												if( error ) { console.error( "Select problem. " + error ); callbackComplete(error) }

												console.log("Combined collections");
												if( callbackComplete ) {
													callbackComplete();
												}
											})
										}
									);
								})
							}
						)
					});
			})
	})

}
