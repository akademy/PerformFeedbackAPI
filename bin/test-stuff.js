const MongoClient = require('mongodb').MongoClient;
const config = require( '../config/config' );

const mongoUrlFe = `mongodb://${config.local.mongo.host}:${config.local.mongo.port}/performFeeback1`;
const mongoUrlFeed = `mongodb://${config.local.mongo.host}:${config.local.mongo.port}/performFeedback`;

// Compare to pre databases for cross over.
MongoClient.connect(mongoUrlFe, function (error, dbFe) {

	if (error) {
		console.error( "Failed to connect to ", mongoUrlFe);
		return complete(error)
	}
	else {

		MongoClient.connect(mongoUrlFeed, function (error, dbFeed) {

			if (error) {
				console.error( "Failed to connect to ", mongoUrlFeed);
				return complete(error)
			}
			else {
				//console.log("Connected successfully to server and database");

				const collectionFe = dbFe.collection("pre");

				collectionFe.find({}).toArray((error, dataFe) => {
					dbFe.close();

					const collectionFeed = dbFeed.collection("pre");
					collectionFeed.find({}).toArray((error, dataFeed) => {
						dbFeed.close();

						dataFe.forEach( (fe) => {
							for( let i=0; i<dataFeed.length; i++) {
								if( fe.randomUuid === dataFeed[i].randomUuid ) {
									console.log( fe.randomUuid );
								}
							}
						});

						console.log("Finished comparison");

					});

				});
			}
		});
	}
});