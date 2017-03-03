/**
 * Created by sesha on 2/27/17.
 */
'use strict';
var AWS = require("aws-sdk");

// DynamoDB
const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

//  node module to generate random IDs
const hat = require('hat');

var docClient = new AWS.DynamoDB.DocumentClient();

// Tablename
const TABLE_NAME = "dynamo_learning_sesha";


// Full table scan
module.exports.fullTableScan = function(event, context, callback){

    var params = {TableName : TABLE_NAME};

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


// Add a new row
module.exports.addRow = function (event, context, callback) {
    console.log(event);
    var Id = hat();
    var body = JSON.parse(event.body);

    var params = {
        TableName : TABLE_NAME,
        Item: {
            "id" : Id,
            "name" : body.name,
            "email" : body.email,
            "phones" : body.phones
        }
    };

    dynamo.putItem(params, function(err, data) {
        if (err){
            callback(err,null);
        }
        else {           // successful response
                         //var Id = { "Id" : Id };
            const response = {
                statusCode: 200,
                body: "Row added"
            };
            callback(null, response);
        }
    });

};


// Edit Row
module.exports.editRow = function (event, context, callback) {
    var reqData = JSON.parse(event.body);
    var params = {
        TableName: TABLE_NAME,
        Key: {
            "id" : event.pathParameters.id
        },
        UpdateExpression: "set email = :email",
        ExpressionAttributeValues:{
            ":email": reqData.email
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


// Delete Row
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

