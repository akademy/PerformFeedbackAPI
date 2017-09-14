#!/bin/bash

# Mongo Database Snapshot

echo "Databases snapshot started"

DEST=/home/template-user/backups
DAY=`date +"%u"`

# mongo --quiet performFeedback --eval "db.getCollectionNames().join('\n')"

#sudo docker-compose exec performFeedbackApiMongo sh -c 'exec mongodump -o=- pre | gzip > $DEST/PerformFeedback.$DAY.gz'                                                                                                  


for COLLECTION in `docker-compose exec performFeedbackApiMongo sh -c "exec mongo --quiet performFeedback --eval \"db.getCollectionNames().join(' ')+ ' dummy'\""`; do

	docker-compose exec performFeedbackApiMongo bash -c 'echo '$COLLECTION
	docker-compose exec performFeedbackApiMongo bash -c 'exec mongodump -d performFeedback -o - -c '$COLLECTION  | gzip --best > $DEST/$COLLECTION.$DAY.gz
	

done


                                                                                                               
echo "Databases snapshot finished"
