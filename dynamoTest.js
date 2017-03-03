/**
 * Created by sesha on 2/27/17.
 */
'use strict';
var AWS = require("aws-sdk");
var fs = require('file-system');

// DynamoDB
const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

//  node module to generate random IDs
const hat = require('hat');

var docClient = new AWS.DynamoDB.DocumentClient();

// Tablename
const TABLE_NAME = "dynamo_learning_sesha";
const MOVIES_TABLE = "dynamo_test_movies";


///////////////////////////////////////////////////////////////////////////
//                               Create Movies table                     //
// Hash key: year | Sort key = title
///////////////////////////////////////////////////////////////////////////

module.exports.createTable = function(event, context, callback){
    var params = {
        TableName : "dynamo_test_movies",
        KeySchema: [
            { AttributeName: "year", KeyType: "HASH"},  //Partition key
            { AttributeName: "title", KeyType: "RANGE" }  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "year", AttributeType: "N" },
            { AttributeName: "title", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        }
    };

    dynamo.createTable(params, function(err, data) {
        if (err) {
            callback(err,null);
        } else {
            const response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify(data)
            };
            callback(null, response);
        }
    });
};



///////////////////////////////////////////////////////////////////////////
//                              Create New Item                          //
// Fetches all records from the table
// https://c85s7ogvfk.execute-api.us-east-1.amazonaws.com/dev/addRow
/*

  {
   "yr": 2017,
   "title": "NewYork Life Insurers",
   "info" : {
         "Plot"  : "Story of 36 talented members",
         "rating" : 0
       }

  }

 */
///////////////////////////////////////////////////////////////////////////



module.exports.addRow = function (event, context, callback) {

    var body = JSON.parse(event.body);
    //var y = body.yr;

    var params = {
        TableName : MOVIES_TABLE,
        Item: {
            "year" : body.yr,
            "title": body.title,
            "info" : body.info
        }
    };

    dynamo.putItem(params, function(err, data) {
        if (err){
            callback(err,null);
        }
        else {
            const response = {
                statusCode: 200,
                body: "Row added"
            };
            callback(null, response);
        }
    });

};


///////////////////////////////////////////////////////////////////////////
//                Edit Row
// For the movie "NewYork Life Insurers" released in 2017,
//  set the rating to 10 and add attribute "actors" with values Sandarsh and Pranav
// https://c85s7ogvfk.execute-api.us-east-1.amazonaws.com/dev/editRow

///////////////////////////////////////////////////////////////////////////

module.exports.editRow = function (event, context, callback) {
    var reqData = JSON.parse(event.body);


    var year = 2017;
    var title = "NewYork Life Insurers";


    var params = {
        TableName:MOVIES_TABLE,
        Key:{
            "year": year,
            "title": title
        },
        UpdateExpression: "set info.rating = :r, info.plot=:p, info.actors=:a",
        ExpressionAttributeValues:{
            ":r":10,
            ":p":"Where insurance is everything",
            ":a":["Pranav" , "Sandarsh"]
        },
        ReturnValues:"UPDATED_NEW"
    };


    dynamo.updateItem(params, function(err, data) {
        if (err){
            callback(err,null);
        }
        else {
            const response = {
                statusCode: 200,
                body: JSON.stringify(data)
            };
            callback(null, response);
        }
    });
};


///////////////////////////////////////////////////////////////////////////
//                              Full table scan                          //
// Fetches all records from the table
// https://c85s7ogvfk.execute-api.us-east-1.amazonaws.com/dev/fullTableScan
///////////////////////////////////////////////////////////////////////////
module.exports.fullTableScan = function(event, context, callback){

    var params = {TableName : MOVIES_TABLE};

    dynamo.scan(params, function(err, data){
        if(err){
            callback(err,null);
        } else {
            // callback(null, data);
            const response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify(data)
            };
            callback(null, response);
        }
    });

};


///////////////////////////////////////////////////////////////////////////
//                               Get Record                             //
// Given a movie title and release year, fetch the movie
// https://c85s7ogvfk.execute-api.us-east-1.amazonaws.com/dev/getRecord/Superstar/1999
///////////////////////////////////////////////////////////////////////////
module.exports.getRecord = function (event, context, callback) {

    var year = parseInt(event.pathParameters.year);
    var params = {
        TableName: MOVIES_TABLE,
        Key : {
            "year" : year,
            "title": event.pathParameters.title
        }

    };

    docClient.get(params, function(err, data) {
        if (err) {
            callback(err,null);
        } else {
            // callback(null, data);
            const response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify(data)
            };
            callback(null, response);
        }
    });

};




///////////////////////////////////////////////////////////////////////////
//                               getRecordRange                         //
// Given a release year, fetch the movies that have their title starting
// with 2
// Url: https://c85s7ogvfk.execute-api.us-east-1.amazonaws.com/dev/getRecordRange
///////////////////////////////////////////////////////////////////////////

module.exports.getRecordRange = function (event, context, callback) {

    var params = {
        TableName : MOVIES_TABLE,
        KeyConditionExpression: "#yyear = :yr AND  begins_with(title,  :t)",
        ExpressionAttributeNames : {
          "#yyear" : "year"
        },
        ExpressionAttributeValues: {
            ":yr":2013,
            ":t": "2"
        }
    };

    dynamo.query(params, function(err, data) {
        if (err) {
            callback(err,null);
        } else {
            // callback(null, data);
            const response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify(data)
            };
            callback(null, response);
        }
    });


};




///////////////////////////////////////////////////////////////////////////
// Delete Row
///////////////////////////////////////////////////////////////////////////

module.exports.deleteRow = function (event, context, callback) {
    var params  = {
        TableName : TABLE_NAME,
        Key: {
            "id" : event.pathParameters.id
        }

    };

    docClient.delete(params, function (err, data) {
        if (err){
            callback(err,null);
        }
        else {
            const response = {
                statusCode: 200,
                body: "Row deleted"
            };
            callback(null, response);
        }
    });

};

