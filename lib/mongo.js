const MongoClient = require('mongodb').MongoClient;
const config = require( '../config/config' );

const mongoUrl = `mongodb://${config.local.mongo.host}:${config.local.mongo.port}/${config.mongo.database}`;

let mongo = {

	prepareUpsert: (data, modifiedTimeClient) => {

		const now = (new Date()).toISOString();

		/*	return {
				'$set': {
					...data, // Spread operator only valid in Node v8 :(
					modifiedTime: now,
					modifiedTimeClient: modifiedTimeClient
				},
				'$setOnInsert': {
					createdTime: now,
					createdTimeClient: modifiedTimeClient,
				}
			}
		*/

		let upsert = {
			'$set': {
				modifiedTime: now,
				modifiedTimeClient: modifiedTimeClient
			},
			'$setOnInsert': {
				createdTime: now,
				createdTimeClient: modifiedTimeClient,
			}
		};

		Object.assign(upsert['$set'], data );

		return upsert;
	},

	upsert : (collectionName, find, data, complete) => {
		MongoClient.connect(mongoUrl, function (error, db) {
			if (error) {
				console.error( "Failed to connect to ", mongoUrl);
				return complete(error)
			}
			else {
				//console.log("Connected successfully to server and database");

				const collection = db.collection(collectionName);

				collection.findOneAndUpdate(find, data, {
					returnOriginal: false,
					upsert: true
				}, (error, data) => {
					db.close();
					return complete(error, data);
				});
			}
		});
	},
	update : (collectionName, find, data, complete) => {
		MongoClient.connect(mongoUrl, function (error, db) {
			if (error) {
				console.error( "Failed to connect to ", mongoUrl);
				return complete(error)
			}
			else {
				//console.log("Connected successfully to server and database");

				const collection = db.collection(collectionName);

				collection.updateOne(find, data, (error, data) => {
					db.close();
					return complete(error, data);
				});
			}
		});
	},
	insertMany : (collectionName, data, complete) => {
		MongoClient.connect(mongoUrl, function (error, db) {
			if (error) {
				console.error( "Failed to connect to ", mongoUrl);
				return complete(error)
			}
			else {
				//console.log("Connected successfully to server and database");

				const collection = db.collection(collectionName);

				collection.insertMany( data,  (error, data) => {
						db.close();
						return complete(error, data);
					});
			}
		});
	},
	select : (collectionName, find, complete )=>{
		MongoClient.connect(mongoUrl, function (error, db) {
			if (error) {
				console.error( "Failed to connect to ", mongoUrl);
				return complete(error)
			}
			else {
				//console.log("Connected successfully to server and database");

				const collection = db.collection(collectionName);

				collection.find(find).toArray((error, data) => {
					db.close();
					return complete(error, data);
				});
			}
		});

	},
	/*selectAll : ( complete ) => {
		MongoClient.connect(mongoUrl, function (error, db) {
			if (error) {
				console.error("Failed to connect to ", mongoUrl);
				return complete(error)
			}
			else {
				console.log("Connected successfully to server and database");

				const collectionPre = db.collection(config.mongo.collections.pre);
				let data = {};
				collectionPre.find( {} ).toArray( (error, dataPre) => {

					//dataPre = [{a: 1, b: 2}, {a: 3, b: 4}];
					data.pre = dataPre;

					const collectionLive = db.collection(config.mongo.collections.live);
					collectionLive.find( {} ).toArray( (error, dataLive) => {

						//dataLive = [{c: 1, d: 2}, {c: 3, d: 4}];
						data.live = dataLive;

						const collectionPost = db.collection(config.mongo.collections.post);

						collectionPost.find( {} ).toArray( (error, dataPost) => {
							//dataPost = [{e: 1, f: 2}, {e: 3, f: 4}];
							data.post = dataPost;

							db.close();

							return complete(error, data);
						});
					});
				});
			}
		})
	},*/
	duplicateCollection : ( fromCollectionName, toCollectionName, complete ) => {
		MongoClient.connect(mongoUrl, function (error, db) {

			if( error ) {
				return complete(error);
			}
			const collectionFrom = db.collection(fromCollectionName);
			const collectionTo = db.collection(toCollectionName);

			collectionFrom.find({}).toArray( (errorFrom, data) => {
				if( error ) {
					return complete(errorFrom);
				}
				collectionTo.insertMany( data,  (errorTo) => {
					db.close();
					return complete(errorTo);
				});
			});
		});
	},
	remove: ( collectionName, find, complete ) => {
		MongoClient.connect(mongoUrl, function (error, db) {

			if (error) {
				return complete(error);
			}
			const collection = db.collection(collectionName);

			/*collection.removeMany(find, (error) => {
				db.close();
				return complete(error);
			})*/
			collection.remove(find, (error) => {
				db.close();
				return complete(error);
			})
		});
	},
	drop : ( collectionName, complete ) => {
		MongoClient.connect(mongoUrl, function (error, db) {
			const collection = db.collection(collectionName);
			collection.drop( (error) => {
				db.close();
				complete(error);
			} );
		});
	}
};

module.exports = mongo;