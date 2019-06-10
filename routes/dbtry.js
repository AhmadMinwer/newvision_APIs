var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    
    var MongoClient = require('mongodb').MongoClient;
    var url = 'mongodb://localhost:27017/EmployeeDB';

    MongoClient.connect(url, function(err, db){
        
        if (err) throw err
        var query = { Employeeid: '2' };

        db.collection('Employee').find(query).toArray(function(err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });

});
module.exports = router;