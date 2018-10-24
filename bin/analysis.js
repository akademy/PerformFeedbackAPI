const mongo = require( "../lib/mongo"),
	config = require("../config/config");

const async = require('async');

// Version releases:
// 1.0.1: (Android) 2017-09-10
// 1.0.2 : (iOS) 2017-09-18, (Android) 2017-09-16?
// 1.0.3 : (iOS) 2017-09-25, (Android) 2017-09-22
// 1.1.1 : (ios) 2018-01-21, (android) 2018-01-20
// setup
//

/*
	CSV export
	mongoexport --host localhost --db performFeedback --collection reduced --type=csv --out test.csv --fields randomUuid,modifiedTime,modifiedTimeClient,randomId,dateOfBirth,musicTraining,musicField,mathTraining,mathField,education,educationOther,musicListen,createdTime,createdTimeClient,additional.appOs,post.performanceId,post.modifiedTime,post.modifiedTimeClient,post.musicLength,post.describe,post.influences,post.enjoy,post.familiar,post.often,post.familiarPiece,post.participation,post.motivation,post.comments,post.createdTime,post.createdTimeClient,live.createdTime,live.createdTimeClient,live.modifiedTime,live.modifiedTimeClient,live.data.raw
 */

let performanceManchester2017 = "manchester2017";
let performanceOxford2018 = "oxfordJanuary2018";

let analysePerformance = performanceManchester2017;//performanceOxford2018;//

let startTimePlusFiveMinutes,
	preIncludeAfter,
	liveIncludeAfter,
	postIncludeAfter;

// Performance Manchester2017
if( analysePerformance === performanceManchester2017 ) {
	// About the time the performance took place
	startTimePlusFiveMinutes = '2017-10-04T19:15:00';

	preIncludeAfter = "2017-09-22";
	liveIncludeAfter = "2017-10-04";
	postIncludeAfter = "2017-10-04";
}
else if( analysePerformance === performanceOxford2018 ) {
	startTimePlusFiveMinutes = '2017-10-04T19:15:00';

	preIncludeAfter = "2018-01-21";
	liveIncludeAfter = "2018-01-27";
	postIncludeAfter = "2018-01-27";
}

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

							duplicateReduced( (error) => {
								if (error) { return; }

								switchLiveToOffsets( (error) => {
									if (error) { return; }

									flattenAndDuplicate( (error) => {
										if (error) { return; }

										// mongoexport -d performFeedback -c flattenLive --type=csv -o live.csv --fields "randomUuid,createdTime,createdTimeClient,modifiedTime,modifiedTimeClient,data"

										// (without live) mongoexport -d performFeedback -c flatten --type=csv -o data.csv --fields "randomUuid,modifiedTime,modifiedTimeClient,randomId,dateOfBirth,musicTraining,musicField,mathTraining,mathField,education,educationOther,musicListen,createdTime,createdTimeClient,additional_appOs,post_performanceId,post_modifiedTime,post_modifiedTimeClient,post_musicLength,post_describe,post_influences,post_enjoy,post_familiar,post_often,post_familiarPiece,post_participation,post_motivation,post_comments,post_createdTime,post_createdTimeClient"
										// (with live) mongoexport -d performFeedback -c flatten --type=csv -o data.csv --fields "randomUuid,modifiedTime,modifiedTimeClient,randomId,dateOfBirth,musicTraining,musicField,mathTraining,mathField,education,educationOther,musicListen,createdTime,createdTimeClient,additional_appOs,post_performanceId,post_modifiedTime,post_modifiedTimeClient,post_musicLength,post_describe,post_influences,post_enjoy,post_familiar,post_often,post_familiarPiece,post_participation,post_motivation,post_comments,post_createdTime,post_createdTimeClient,live_createdTime,live_createdTimeClient,live_modifiedTime,live_modifiedTimeClient,live_data"
									})
								});
							});
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
							if (lives[i].createdTime > startTimePlusFiveMinutes) { // About 5 mins before the performance

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
						message += new Date(livesNew[i].data[0].ts).toISOString().replace("2018-01-27T","") + " ";
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

				mongo.update( config.mongo.collections.reduced, {"_id":data._id}, data, (error) => {
					eachComplete(error);
				});
				//eachComplete();
			},
			(error) => {
				console.log("Done live clean");
				complete(error);
			}
		)
	});
}

function switchLiveToOffsets( complete ) {
	mongo.select(config.mongo.collections.offset, {"live" : { "$exists" : true } }, (error, datas) => {
		if (error) {
			console.error("Couldn't select. " + error);
			return;
		}

		async.eachLimit(datas, 4,

			(data, eachComplete) => {

				const firstTimestamp = data.live.data[0].ts;

				for (let i = 0, z = data.live.data.length; i < z; i++) {
					data.live.data[i].offset = data.live.data[i].ts - firstTimestamp;
				}

				mongo.update( config.mongo.collections.offset, {"_id":data._id}, data, (error) => {
					eachComplete(error);
				});
				//eachComplete();
		},
			(error) => {
				console.log("Switched to offset");

				complete(error);
			}
		);
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
		{"modifiedTime" : { "$not" : { "$gt" : preIncludeAfter } } }, // Before release date
		{ "lives.modifiedTime" : { "$not" : { "$gt" : liveIncludeAfter } } }, // Before performance
		{ "post.modifiedTime" : { "$not" : {"$gt" : postIncludeAfter } } } // Before performance
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

function duplicateReduced( complete ) {
	mongo.duplicateCollection(
		config.mongo.collections.reduced,
		config.mongo.collections.offset,
		(error) => {
			if (error) {
				console.error("Couldn't duplicate to offset " + error);
				return;
			}

			console.log("Duplicated to Offset");

			complete(error);
		});
}

function dropCollections( complete ) {
	"use strict";
	mongo.drop( config.mongo.collections.combined, (error) => {
		if( error ) { console.error( "Drop problem. " + error ); return complete(error);}
		mongo.drop( config.mongo.collections.reduced, (error) => {
			if (error) { console.error("Drop problem. " + error); return complete(error);}
			mongo.drop( config.mongo.collections.offset, (error) => {
				if (error) { console.error("Drop problem. " + error); return complete(error);}
				mongo.drop( config.mongo.collections.flatten, (error) => {
					if (error) { console.error("Drop problem. " + error); return complete(error);}
					mongo.drop( config.mongo.collections.flattenLive, (error) => {
						if (error) { console.error("Drop problem. " + error); return complete(error);}

						console.log("Dropped collections");
						return complete(error);
					});
				});
			});
		});

	} );
}

function flattenAndDuplicate( complete ) {
	mongo.select(config.mongo.collections.offset, {"live" : { "$exists" : true } }, (error, datas) => {
		if (error) {
			console.error("Couldn't select. " + error);
			return;
		}

		async.eachLimit(datas, 10,

			(data, eachComplete) => {

				if (data.additional) {
					if (data.additional.appOs) {
						data.additional_appOs = data.additional.appOs;
					}
					delete data.additional;
				}
				if( data.post ) {
					let keys = Object.keys( data.post );

					for( let i=0, z=keys.length; i<z; i++ ) {
						data["post_" + keys[i]] = data.post[keys[i]];
						delete data.post[keys[i]];
					}

					if( data.post_describe ) {
						data.post_describe = data.post_describe.join(";;");
					}

					if( data.post_motivation ) {
						data.post_motivation = data.post_motivation.join(";;");
					}

					delete data.post;
				}

				let dataLive = null;
				if( data.live ) {

					let keys = Object.keys( data.live );
					for( let i=0, z=keys.length; i<z; i++ ) {
						data["live_" + keys[i]] = data.live[keys[i]];
						//delete data.live[keys[i]];
					}

					dataLive = data.live;

					let dataLiveData = [];

					for (let i = 0, z = data.live.data.length; i < z; i++) {
						let dataItem = data.live.data[i].offset;
						if( data.live.data[i].ty ) {
							dataItem += ";;" + data.live.data[i].ty;
						}
						if( data.live.data[i].error ) {
							dataItem += ";;error";
						}
						dataLiveData.push( dataItem );
					}

					data.live_data = dataLiveData;

					delete data.live;
					delete data.lives;
				}


				mongo.insertMany( config.mongo.collections.flatten, [data], (error) => {

					//if( dataLive ) {
					//	mongo.insertMany(config.mongo.collections.flattenLive, [dataLive], (error) => {
					//		eachComplete(error);
					//	});
					//}
					//else {
						eachComplete(error);
					//}
				});
			},
			(error) => {
				console.log("Flattened");

				complete(error);
			}
		);
	});
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
