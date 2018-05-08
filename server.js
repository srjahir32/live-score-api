var MongoClient = require('mongodb').MongoClient;

var url = "mongodbURL";

var assert = require('assert');
global.express = require('express');
var app = express();
var bodyParser = require('body-parser');
global.jsonParser = bodyParser.json();
global.moment = require('moment');

//push notification
var FCM = require('fcm-node');
var serverKey = 'Serkver Key';
global.fcm = new FCM(serverKey);

var schedule = require('node-schedule');
global._ = require('underscore');
var fs = require('fs');
global.isJSON = require('is-valid-json');
global.ObjectId = require('mongodb').ObjectId;

MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    //live server test database
    global.dbo = db.db("fifa");

    //live server database
    //global.dbo = db.db("fifa_world_cup");


    //global.dbo = db.db('heroku_crw649t8');
    global.db = db;
    console.log("Database connected");
});

global.request = require('request');
global.API_Url = "API URL";
global.token = "?Authorization=auth_token";

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization, Access-Control-Allow-Headers");
    next();
});
app.use(express.static(__dirname + '/'));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

var router = express.Router();

var server = require('http').createServer(app);
global.io = require('socket.io').listen(server);
// var io = require('socket.io')({
//     transports: ['xhr-polling'],
// }).listen(server);

// io.sockets.on('connection', function (socket) {
//     console.log("Connected");
// });
var jwt = require('jwt-simple');
var secret = 'Test';

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// setTimeout(() => {
// }, 3000);

function distinct(items, prop) {
    var unique = [];
    var distinctItems = [];

    _.each(items, function (item) {
        if (unique[item[prop]] === undefined) {
            distinctItems.push(item);
        }

        unique[item[prop]] = 0;
    });

    return distinctItems;
}


//********************************************New Section**************************************************

function GetDate(date) {

    var today = new Date(date);
    var dd = today.getDate();

    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = dd + '.' + mm + '.' + yyyy;
    return today;

}

var ArrayList = [];
var logs = [];

app.get('/GetAllTodayMatch', function (req, res) {

    var myquery = {
        formatted_date: GetDate(new Date())
    };

    dbo.collection("matches").find(myquery).toArray(function (err, data) {

        var i = 0;
        console.log("Total Matchs data: " + data.length);

        if (data.length > 0) {
            function uploader(i) {
                if (i < data.length) {

                    var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
                    //var dt = new Date(data[i].formatted_date.replace(pattern, '$3-$2-$1') + 'T' + data[i].time);
                    var date = moment(data[i].formatted_date.replace(pattern, '$3-$2-$1') + 'T' + data[i].time).format('YYYY-MM-DD HH:mm:ss');

                    var obj = {
                        id: data[i].id,
                        comp_id: data[i].comp_id,
                        localteam_id: data[i].localteam_id,
                        localteam_name: data[i].localteam_name,
                        visitorteam_id: data[i].visitorteam_id,
                        visitorteam_name: data[i].visitorteam_name,
                        match_date: date
                    };

                    var myquery = {
                        id: data[i].id
                    };

                    dbo.collection("today_matches").findOne(myquery, function (err, result) {
                        if (!result) {
                            dbo.collection("today_matches").insertOne(obj, function (err, result) {
                                if (err) throw err;
                            });
                        }
                        // else {
                        //     dbo.collection("commentaries").deleteOne(myquery, function (err, obj) {
                        //         if (err) throw err;
                        //     })
                        // }
                    });

                    if ((i + 1) == data.length) {
                        console.log("Done");
                        SetIntervalForMatchs();
                        response = {
                            "message": 'Success'
                        };
                        res.json(response);
                    } else {
                        uploader(i + 1);
                    };
                }
            }
            uploader(i);

        } else {
            response = {
                "message": "No Any Record found for current Time: " + moment().format("HH:mm")
            };
            res.json(response);
        }


    });

});

// setTimeout(() => {
//     SetIntervalForMatchs();
// }, 3000);

function SetIntervalForMatchs() {

    console.log("Inside the Interval!!!!");

    setInterval(() => {

        console.log("Current DateTime: " + moment().format("DD-MM-YYYY HH:mm:ss"));

        // console.log(moment().utcOffset(0).add(7, 'hours').format('DD-MM-YYYY HH:mm'));
        // console.log(moment().utcOffset(0).add(8, 'hours').format('DD-MM-YYYY HH:mm'));

        // var date = "2018-04-18";
        // var time = "06:15";
        // var timeAndDate = moment(date + ' ' + time);

        // var date1 = "2018-04-18";
        // var time1 = "06:30";
        // var timeAndDate1 = moment(date1 + ' ' + time1);

        dbo.collection("today_matches").find({
            "match_date": {
                "$gte": moment().format("YYYY-MM-DD HH:mm"),
                "$lte": moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')
                // "$gte": moment(timeAndDate).format("DD-MM-YYYY HH:mm"),
                // "$lte": moment(timeAndDate1).format("DD-MM-YYYY HH:mm"),

            }
        }).toArray(function (err, data) {
            console.log("Today total matchs: " + data.length);

            // ArrayList = _.without(ArrayList, _.findWhere(ArrayList, {
            //     id: '0'
            // }));

            //Remove array of object where match time and current time diff. is greater than 3 hours 
            ArrayList = _.reject(ArrayList, function (obj) {
                var matchtime = moment(obj.match_date);
                var currenttime = moment();
                var diff = currenttime.diff(matchtime, 'hours');
                if (diff >= 3) {
                    dbo.collection("today_matches").deleteOne({
                        id: obj.id.toString()
                    }, function (err, result) {
                        assert.equal(null, err);
                    });
                    return obj.id == obj.id;
                }
            });


            ArrayList = _.reject(ArrayList, function (num) {
                return num.id == '0';
            });

            console.log("Remove Array if id is '0' ");
            console.log(ArrayList);

            if (data.length > 0) {

                var result = data.filter(function (o1) {
                    // filter out (!) items in result2
                    return ArrayList.some(function (o2) {
                        return o1.id === o2.id; // assumes unique id
                    });
                });

                if (result.length == 0) {
                    console.log("Add New Record in ArrayList");
                    for (var index = 0; index < data.length; index++) {
                        ArrayList.push(data[index]);
                    }
                } else {
                    console.log("Existing Record in ArrayList");
                }

            }

            var m = 0;

            function GetCommentariesData(m) {
                console.log("Inside the Get Commentaries Data");

                if (m < ArrayList.length) {

                    if (ArrayList[m].id != '0') {

                        console.log("Commentaries Data Get by Match Id " + ArrayList[m].id);

                        request(API_Url + 'commentaries/' + ArrayList[m].id + token, function (err, res1, body) {
                            if (isJSON(body)) {
                                var ObjData = JSON.parse(body);
                                console.log("Inside the body if json is valid");
                                if (ObjData) {
                                    console.log("Inside the data if data available");
                                    if (ObjData.comments != undefined && ObjData.comments != null && ObjData.comments != '') {

                                        console.log("Array List commentaries table Match Id " + ArrayList[m].id.toString());

                                        dbo.collection("commentaries").deleteOne({
                                            match_id: ArrayList[m].id.toString()
                                        }, function (err, result) {
                                            assert.equal(null, err);
                                            dbo.collection("commentaries").insert(ObjData, function (err, result) {
                                                console.log("Insert commentaries by Id: " + ArrayList[m].id);

                                            })
                                        });


                                        if (ObjData.comments.length > 1) {
                                            console.log("Inside the comments if comments found");
                                            //send data to socket
                                            io.sockets.emit("response", {
                                                "data": {
                                                    "commentaries": ObjData
                                                }
                                            });

                                            var callevents = false;
                                            if (ObjData.comments.length > 0 && ObjData.comments[0].important == 1) {
                                                callevents = true;
                                            }
                                            if (ObjData.comments.length > 1 && ObjData.comments[1].important == 1) {
                                                callevents = true;
                                            }
                                            if (ObjData.comments.length > 2 && ObjData.comments[2].important == 1) {
                                                callevents = true;
                                            }
                                            if (ObjData.comments.length > 3 && ObjData.comments[3].important == 1) {
                                                callevents = true;
                                            }
                                            if (ObjData.comments.length > 4 && ObjData.comments[4].important == 1) {
                                                callevents = true;
                                            }
                                            if (callevents) {
                                                console.log("Array List Get Event Match Id " + ArrayList[m].id.toString());
                                                GetMatchEvent(ArrayList[m].id);
                                                //End Get Events after Match finished
                                                io.sockets.emit("pushnotification", {
                                                    "data": {
                                                        "pushdata": ObjData,
                                                        "matchdata": ArrayList[m]
                                                    }
                                                });
                                            }

                                            //delete the record for perticular match is over
                                            var n = ObjData.comments[0].comment.includes("Thats all. Game finished");
                                            var n1 = ObjData.comments[0].comment.includes("Match ends");
                                            if (n || n1) {

                                                console.log("Array List Get Event Match Id " + ArrayList[m].id.toString());
                                                GetMatchEvent(ArrayList[m].id);
                                                //End Get Events after Match finished

                                                console.log("Thats all. Game finished");
                                                console.log("m " + m);
                                                console.log(ArrayList[m]);
                                                console.log("----");
                                                console.log("Array List Length: " + ArrayList.length);

                                                console.log("Array List today_matches delete table Match Id " + ArrayList[m].id.toString());

                                                dbo.collection("today_matches").deleteOne({
                                                    id: ArrayList[m].id.toString()
                                                }, function (err, result) {
                                                    assert.equal(null, err);
                                                    console.log("Deleted Today_match by Id: " + ArrayList[m].id);
                                                });

                                                // ArrayList = _.without(ArrayList, _.findWhere(ArrayList, {
                                                //     id: ArrayList[m].id.toString()
                                                // }));
                                                //remove record from ArrayList
                                                console.log("Without Update Array with id 0");
                                                console.log(ArrayList);

                                                var match = _.find(ArrayList, function (item) {
                                                    return item.id === ArrayList[m].id.toString()
                                                });

                                                if (match) {
                                                    match.id = '0';
                                                }

                                                console.log("Update Array with id 0");
                                                console.log(ArrayList);
                                            }

                                            //GetCommentariesData(m + 1);
                                            setTimeout(() => {
                                                GetCommentariesData(m + 1);
                                            }, 12000);


                                        } else {
                                            console.log("No comments Found");
                                            GetCommentariesData(m + 1);
                                        }
                                    } else {
                                        console.log("No comments Found");
                                        GetCommentariesData(m + 1);
                                    }
                                } else {
                                    console.log("No Commentaries Found");
                                    GetCommentariesData(m + 1);

                                }
                            } else {
                                console.log("No Commentaries Found");
                                GetCommentariesData(m + 1);
                            }

                        });

                    } else {
                        console.log("Array List Id is '0'");
                        GetCommentariesData(m + 1);

                    }
                }
            }
            GetCommentariesData(m);

        });

    }, 60000);

}

function GetMatchEvent(id) {

    //Get Events after Match finished
    console.log("Get Events");
    var path = API_Url + 'matches/' + id + token;

    request(path, function (err, res1, body) {
        if (isJSON(body)) {
            var ObjDataMatch = JSON.parse(body);
            if (ObjDataMatch) {

                //send data to socket
                io.sockets.emit("response", {
                    "data": {
                        "events": ObjDataMatch
                    }
                });


                dbo.collection("matches").deleteMany({
                    id: id.toString()
                }, function (err, result) {
                    assert.equal(null, err);
                    dbo.collection("matches").insert(ObjDataMatch, function (err, result) {

                    })
                });

                return;
            }
        } else {
            return;
        }

    });

    //End Get Events after Match finished

}

//Cron Job For Get All Today Matchs by Every 01.00 AM hours 
var cronJob = require('cron').CronJob;

var job = new cronJob({
    cronTime: '00 01 * * 0-6',
    onTick: function () {
        // Runs everyday
        // at exactly 12:00:00 AM.
        console.log("Cron Job is execute");

        var myquery = {
            formatted_date: GetDate(new Date())
        };

        dbo.collection("matches").find(myquery).toArray(function (err, data) {

            var i = 0;
            console.log(data.length);

            if (data.length > 0) {
                function uploader(i) {
                    if (i < data.length) {

                        var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
                        //var dt = new Date(data[i].formatted_date.replace(pattern, '$3-$2-$1') + 'T' + data[i].time);
                        var date = moment(data[i].formatted_date.replace(pattern, '$3-$2-$1') + 'T' + data[i].time).format('YYYY-MM-DD HH:mm:ss');

                        var obj = {
                            id: data[i].id,
                            comp_id: data[i].comp_id,
                            localteam_id: data[i].localteam_id,
                            localteam_name: data[i].localteam_name,
                            visitorteam_id: data[i].visitorteam_id,
                            visitorteam_name: data[i].visitorteam_name,
                            match_date: date
                        };

                        var myquery = {
                            id: data[i].id
                        };

                        dbo.collection("today_matches").findOne(myquery, function (err, result) {
                            if (!result) {
                                dbo.collection("today_matches").insertOne(obj, function (err, result) {
                                    if (err) throw err;
                                });
                            }
                            // else {
                            //     dbo.collection("commentaries").deleteOne(myquery, function (err, obj) {
                            //         if (err) throw err;
                            //     })
                            // }
                        });

                        if ((i + 1) == data.length) {
                            console.log("Done");
                            SetIntervalForMatchs();
                        } else {
                            uploader(i + 1);
                        };
                    }
                }
                uploader(i);

            } else {
                console.log("No Any Record found for current Time: " + moment().format("HH:mm"));
            }


        });


    },
    start: false
});

job.start();

// app.get('/log', function (req, res) {
//     res.sendFile(__dirname + '/logfile.txt');
// });

// app.get('/clearlog', function (req, res) {
//     try {
//         fs.writeFileSync('logfile.txt', '');
//         res.sendFile(__dirname + '/logfile.txt');
//     } catch (e) {
//         console.log("Cannot write file ", e);
//     }

// });

app.get('/SendSocketData', function (req, res) {
    io.sockets.emit("response", {
        "data": {
            "events": "qwe"
        }
    });
});


app.use('/SetData', require('./controllers/SetData'));
app.use('/MobileAPI', require('./controllers/MobileAPI'));



//************************************************End***************************************************

// setTimeout(() => {

//     setInterval(() => {

//         dbo.collection("commentaries").find({
//             "match_id": "2358053"
//         }).toArray(function (err, data) {
//             console.log("----");
//             var obj = [{
//                 "id": "2365623",
//                 "comp_id": "1007",
//                 "localteam_id": "6468",
//                 "localteam_name": "Salzburg",
//                 "visitorteam_id": "10042",
//                 "visitorteam_name": "Olympique Marseille",
//                 "match_date": "2018-05-03 19:05:00"
//             }, {
//                 "id": "2365623",
//                 "comp_id": "1007",
//                 "localteam_id": "6468",
//                 "localteam_name": "Salzburg",
//                 "visitorteam_id": "10042",
//                 "visitorteam_name": "Olympique Marseille",
//                 "match_date": "2018-05-03 19:05:00"
//             }, {
//                 "id": "2358053",
//                 "comp_id": "1007",
//                 "localteam_id": "11998",
//                 "localteam_name": "Salzburg",
//                 "visitorteam_id": "15702",
//                 "visitorteam_name": "Olympique Marseille",
//                 "match_date": "2018-05-03 19:05:00"
//             }];
//             var lst = [];
//             for (let index = 0; index < 3; index++) {
//                 lst.push(obj[index]);
//             }

//             // dbo.collection("users").find({
//             //     $and: [{
//             //         notification: "true"
//             //     }],
//             //     $or: [{
//             //             favoriteteam: {
//             //                 $regex: "(?<=,|^)(\s*)" + lst[1].localteam_id + "(?=\s*,|\s*$)"
//             //             }
//             //         },
//             //         {
//             //             favoriteteam: {
//             //                 $regex: "(?<=,|^)(\s*)6468qwe(?=\s*,|\s*$)"
//             //             }
//             //         }
//             //     ]
//             // }).toArray(function (err, resObj) {

//             //     console.log(resObj);


//             // })

//             io.sockets.emit("pushnotification", {
//                 "data": {
//                     "pushdata": data,
//                     "matchdata": lst[2]
//                 }
//             });
//         });

//     }, 60000);
// }, 3000);



var port = process.env.PORT || 8080;

server.listen(port, function () {
    console.log('listening on *:' + port);
});

module.exports = app;
