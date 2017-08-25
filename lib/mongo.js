const MongoClient = require('mongodb').MongoClient;
const config = require( '../config/config' );

const mongoUrl = `mongodb://${config.local.mongo.host}:${config.local.mongo.port}/${config.mongo.database}`;

let mongo = {

	prepareUpsert: (data, modifiedTimeClient) => {

		const now = (new Date()).toISOString();
		return {
			'$set' : {
				...data,
				modifiedTime: now,
				modifiedTimeClient : modifiedTimeClient
			},
			'$setOnInsert': {
				createdTime: now,
				createdTimeClient: modifiedTimeClient,
			}
		}
	},

	upsert : (collectionName, find, data, complete) => {
		MongoClient.connect(mongoUrl, function (error, db) {
			if (error) {
				console.error("Failed to connect to", mongoUrl);
				return complete(error)
			}
			else {
				console.log("Connected successfully to server and database");

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
	}
};

module.exports = mongo;