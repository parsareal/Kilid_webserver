const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/KilidApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to mongo...');
    }
    console.log('Connect to mongo...');
    db.close();
})