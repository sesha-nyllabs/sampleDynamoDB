
// This is a node js script that loads the sample data from
// moviedata.json to a dynamo table .
// it is not linked with serverless yml

/**
 * Created by sesha on 3/3/17.
 */
var AWS = require("aws-sdk");
// var fs = require("fs");
var allMovies = require("./moviedata");

// console.log("mvs"+JSON.stringify(allMovies));

AWS.config.update({
    region: "us-east-1"
});



var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing movies into DynamoDB. Please wait.");

// var allMovies = JSON.parse(fs.readFileSync('moviedata.json', 'utf8'));
allMovies.forEach(function(movie) {
    var params = {
        TableName: "dynamo_test_movies",
        Item: {
            "year":  movie.year,
            "title": movie.title,
            "info":  movie.info
        }
    };

    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add movie", movie.title, ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", movie.title);
        }
    });
});