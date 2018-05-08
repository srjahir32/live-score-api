var router = express.Router();
var ioClient = require('socket.io-client');

router.get('/GetAllCompetitions', function (req, res) {

    dbo.collection("competitions").find().toArray(function (err, data) {
        // Mongo command to fetch all data from collection.
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            if (data.length > 0) {
                response = {
                    "success": true,
                    "data": data
                };
            } else {
                response = {
                    "success": false,
                    "message": "No Record found..."
                };
            }
            res.json(response);
        }
    });


})

router.get('/GetCompetitionStandingById', function (req, res) {

    var comp_id = req.query.comp_id;

    if (comp_id != '' && comp_id != undefined && comp_id != null) {
        dbo.collection("competition_standing").find({
            comp_id: comp_id
        }).toArray(function (err, data) {
            // Mongo command to fetch all data from collection.
            if (err) {
                response = {
                    "error": true,
                    "message": "Error fetching data"
                };
            } else {
                if (data.length > 0) {
                    response = {
                        "success": true,
                        "data": data
                    };
                } else {
                    response = {
                        "success": false,
                        "message": "No Record found..."
                    };
                }
                res.json(response);
            }
        });
    } else {
        response = {
            "success": false,
            "message": "comp_id is not available..."
        };
        res.json(response);
    }
});

router.get('/GetMatchesByCompetitionId', function (req, res) {

    var comp_id = req.query.comp_id;

    if (comp_id != '' && comp_id != undefined && comp_id != null) {
        dbo.collection("matches").find({
            comp_id: comp_id
        }).toArray(function (err, data) {
            // Mongo command to fetch all data from collection.
            if (err) {
                response = {
                    "error": true,
                    "message": "Error fetching data"
                };
            } else {
                if (data.length > 0) {
                    response = {
                        "success": true,
                        "data": data
                    };
                } else {
                    response = {
                        "success": false,
                        "message": "No Record found..."
                    };
                }
                res.json(response);
            }
        });
    } else {
        response = {
            "success": false,
            "message": "comp_id is not available..."
        };
        res.json(response);
    }
});

router.get('/GetTeamById', function (req, res) {

    var team_id = req.query.team_id;

    if (team_id != '' && team_id != undefined && team_id != null) {
        dbo.collection("team").find({
            team_id: team_id
        }).toArray(function (err, data) {
            // Mongo command to fetch all data from collection.
            if (err) {
                response = {
                    "error": true,
                    "message": "Error fetching data"
                };
            } else {
                if (data.length > 0) {

                    dbo.collection("matches").find({
                        $or: [{
                                localteam_id: team_id
                            },
                            {
                                visitorteam_id: team_id
                            }
                        ]
                    }).toArray(function (err, resMatch) {

                        data[0].matchs = resMatch
                        response = {
                            "success": true,
                            "data": data
                        };
                        res.json(response);
                    });

                } else {
                    response = {
                        "success": false,
                        "message": "No Record found..."
                    };
                    res.json(response);
                }

            }
        });
    } else {
        response = {
            "success": false,
            "message": "comp_id is not available..."
        };
        res.json(response);
    }
});

router.get('/GetPlayerProfileById', function (req, res) {

    var player_id = req.query.player_id;

    if (player_id != '' && player_id != undefined && player_id != null) {
        dbo.collection("player_profile").find({
            id: player_id
        }).toArray(function (err, data) {
            // Mongo command to fetch all data from collection.
            if (err) {
                response = {
                    "error": true,
                    "message": "Error fetching data"
                };
            } else {
                if (data.length > 0) {
                    response = {
                        "success": true,
                        "data": data
                    };
                } else {
                    response = {
                        "success": false,
                        "message": "No Record found..."
                    };
                }
                res.json(response);
            }
        });
    } else {
        response = {
            "success": false,
            "message": "comp_id is not available..."
        };
        res.json(response);
    }
});

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

router.get('/GetMatchesByDate', function (req, res) {

    var date = req.query.date;
    if (date != '' && date != undefined && date != null) {
        dbo.collection("matches").find({
            formatted_date: GetDate(date)
        }).toArray(function (err, data) {
            // Mongo command to fetch all data from collection.
            if (err) {
                response = {
                    "error": true,
                    "message": "Error fetching data"
                };
            } else {
                if (data.length > 0) {
                    response = {
                        "success": true,
                        "data": data
                    };
                } else {
                    response = {
                        "success": false,
                        "message": "No Record found..."
                    };
                }
                res.json(response);
            }
        });
    } else {
        response = {
            "success": false,
            "message": "date is not available..."
        };
        res.json(response);
    }
});

// Create New User 
router.post('/CreateUser', jsonParser, function (req, res) {
    objUser = req.body;
    var User = dbo.collection("users");

    if (objUser.deviceId != '' && objUser.deviceId != null && objUser.deviceId != undefined) {
        if (objUser.firebasetoken != '' && objUser.firebasetoken != null && objUser.firebasetoken != undefined) {

            User.findOne({
                deviceId: objUser.deviceId
            }, function (err, resUser) {
                if (!err) {
                    if (resUser) {
                        var length = _.size(resUser.favoriteteam);

                        if (length > 0) {
                            if (resUser.favoriteteam.includes(objUser.favoriteteam)) {
                                res.json({
                                    success: false,
                                    message: "your favorite team alredy exist..."
                                });
                            } else {
                                User.update({
                                    _id: ObjectId(resUser._id)
                                }, {
                                    $set: {
                                        favoriteteam: objUser.favoriteteam
                                    }
                                });

                                res.json({
                                    success: true,
                                    message: "your favorite team updated successfully..."
                                });
                            }
                        } else {
                            User.update({
                                _id: ObjectId(resUser._id)
                            }, {
                                $set: {
                                    favoriteteam: objUser.favoriteteam
                                }
                            });

                            res.json({
                                success: true,
                                message: "your favorite team created successfully..."
                            });
                        }

                    } else {

                        //Insert New User
                        var obj = {
                            deviceId: objUser.deviceId,
                            firebasetoken: objUser.firebasetoken,
                            favoriteteam: objUser.favoriteteam,
                            notification: objUser.notification,
                        };
                        User.insertOne(obj, function (err, result) {
                            if (err) throw err;
                            res.json({
                                success: true,
                                message: "User created successfully..."
                            });
                        });
                    }

                } else {
                    res.json({
                        success: false,
                        message: "Error for find using device token!!!"
                    });
                }
            });

        } else {
            res.json({
                success: false,
                message: "firebasetoken not found!!!"
            });
        }
    } else {
        res.json({
            success: false,
            message: "DeviceId not found!!!"
        });

    }

});

router.get('/GetCommentsByMatchId', function (req, res) {

    var match_id = req.query.match_id;

    if (match_id != '' && match_id != undefined && match_id != null) {
        dbo.collection("commentaries").find({
            match_id: match_id
        }).toArray(function (err, data) {
            // Mongo command to fetch all data from collection.
            if (err) {
                response = {
                    "error": true,
                    "message": "Error fetching data"
                };
            } else {
                if (data.length > 0) {
                    response = {
                        "success": true,
                        "data": data[0].comments
                    };
                } else {
                    response = {
                        "success": false,
                        "message": "No Record found..."
                    };
                }
                res.json(response);
            }
        });
    } else {
        response = {
            "success": false,
            "message": "match id is not available..."
        };
        res.json(response);
    }
});

router.get('/GetMatchStatsByMatchId', function (req, res) {

    var match_id = req.query.match_id;

    if (match_id != '' && match_id != undefined && match_id != null) {
        dbo.collection("commentaries").find({
            match_id: match_id
        }).toArray(function (err, data) {
            // Mongo command to fetch all data from collection.
            if (err) {
                response = {
                    "error": true,
                    "message": "Error fetching data"
                };
            } else {
                if (data.length > 0) {
                    response = {
                        "success": true,
                        "data": data[0].match_stats
                    };
                } else {
                    response = {
                        "success": false,
                        "message": "No Record found..."
                    };
                }
                res.json(response);
            }
        });
    } else {
        response = {
            "success": false,
            "message": "match id is not available..."
        };
        res.json(response);
    }
});


router.get('/GetLineupSubByMatchId', function (req, res) {

    var match_id = req.query.match_id;

    if (match_id != '' && match_id != undefined && match_id != null) {
        dbo.collection("commentaries").find({
            match_id: match_id
        }).toArray(function (err, data) {
            // Mongo command to fetch all data from collection.
            if (err) {
                response = {
                    "error": true,
                    "message": "Error fetching data"
                };
            } else {
                if (data.length > 0) {
                    var objLineupSub = {
                        "lineup": data[0].lineup,
                        "subs": data[0].subs
                    };

                    response = {
                        "success": true,
                        "data": objLineupSub
                    };

                } else {
                    response = {
                        "success": false,
                        "message": "No Record found..."
                    };
                }
                res.json(response);
            }
        });
    } else {
        response = {
            "success": false,
            "message": "match id is not available..."
        };
        res.json(response);
    }
});


// router.get('/SendPushNotificationBeforeMatchStart', function (req, res) {

//     var TodayMatch = dbo.collection("today_matches");
//     var User = dbo.collection("users");

//     setInterval(() => {
//         console.log("Start Interval for every 1 hours");
//         TodayMatch.find({}).toArray(function (err, data) {
//             if (data) {
//                 var lst = _.filter(data, function (obj) {
//                     var matchtime = moment(obj.match_date);
//                     var currenttime = moment();
//                     //var currenttime = moment().utcOffset(0).add(10, 'hours');
//                     var diff = currenttime.diff(matchtime, 'minutes');
//                     console.log(diff);
//                     if (diff >= 120 && diff <= 180) {
//                         return obj.id == obj.id;
//                     }
//                 });

//                 var i = 0;

//                 function uploader(i) {
//                     if (i < lst.length) {

//                         if ((i + 1) == lst.length) {
//                             res.json("Send notification");
//                         } else {
//                             uploader(i + 1);
//                         }

//                         User.find({
//                             $and: [{
//                                 notification: "true"
//                             }],
//                             $or: [{
//                                     favoriteteam: {
//                                         $regex: "(?<=,|^)(\s*)" + lst[i].localteam_id + "(?=\s*,|\s*$)"
//                                     }
//                                 },
//                                 {
//                                     favoriteteam: {
//                                         $regex: "(?<=,|^)(\s*)" + lst[i].visitorteam_id + "(?=\s*,|\s*$)"
//                                     }
//                                 }
//                             ]
//                         }).toArray(function (err, resObj) {


//                             if (resObj != null && resObj != '' && resObj != undefined) {
//                                 var j = 0;

//                                 function uploader1(j) {
//                                     if (j < resObj.length) {
//                                         sendPushNotification(lst[i], resObj[j]);
//                                         if ((j + 1) == resObj.length) {
//                                             if ((i + 1) == lst.length) {
//                                                 res.json("Send notification");
//                                             } else {
//                                                 uploader(i + 1);
//                                             }
//                                         } else {
//                                             uploader1(j + 1);
//                                         }
//                                     }
//                                 }
//                                 uploader1(j);
//                             } else {
//                                 console.log("no user team found!!!");
//                                 uploader(i + 1);
//                             }
//                         })
//                     }
//                 }
//                 uploader(i);
//             } else {
//                 res.json({
//                     "success": false,
//                     "message": "Today's Matchs not available..."
//                 });
//             }
//         });

//     }, 3600000);

// });

router.get('/SendPushNotificationBeforeMatchStart', function (req, res) {

    var TodayMatch = dbo.collection("today_matches");
    var User = dbo.collection("users");
    console.log("Staring Push NotificationBefore Match Start");

    setInterval(() => {
        console.log("Start Interval for every 1 hours");
        TodayMatch.find({}).toArray(function (err, data) {
            if (data) {
                var lst = _.filter(data, function (obj) {
                    var matchtime = moment(obj.match_date);
                    var currenttime = moment();
                    //var currenttime = moment().utcOffset(0).add(10, 'hours');
                    var diff = matchtime.diff(currenttime, 'minutes');
                    console.log(diff);
                    if (diff >= 120 && diff <= 180) {
                        return obj.id == obj.id;
                    }
                });

                var i = 0;

                function uploader(i) {
                    if (i < lst.length) {

                        var condition = "'" + lst[i].localteam_id + "' in topics || " + "'" + lst[i].visitorteam_id + "' in topics";
                        //var condition = "'6468' in topics || '9002' in topics";
                        //console.log("'dogs' in topics || 'cats' in topics");
                        console.log(condition);

                        var options = {
                            uri: 'https://fcm.googleapis.com/fcm/send',
                            method: 'POST',
                            headers: {
                                'Authorization': 'key=AIzaSyD-cZhWg_Hju8CUPrpPfHRGeP3jdYhJo7w',
                                'Content-Type': 'application/json'
                            },
                            json: {
                                "condition": condition,
                                data: { //you can send only notification or only data(or include both)
                                    "title": "Match Start",
                                    "body": lst[i].localteam_name + ' v/s ' + lst[i].visitorteam_name + ' - ' + lst[i].match_date,
                                    "action_id": lst[i].id,
                                    "action": "Match Start"
                                }
                            }
                        };

                        request(options, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log("Sent push notification");
                            } else {
                                //res.sendStatus(500);
                                console.log(error);
                            }
                            console.log(body);

                        });

                        if ((i + 1) == lst.length) {
                            //res.json("Send notification");
                            console.log("Send notification");
                        } else {
                            uploader(i + 1);
                        }
                    }
                }

                uploader(i);

            } else {
                // res.json({
                //     "success": false,
                //     "message": "Today's Matchs not available..."
                // });
                console.log("Today's Matchs not available...");
            }
        });

    }, 3600000);

});


function sendPushNotification(objMatch, objUser) {

    //console.log(objMatch);
    var message = {
        to: objUser.firebasetoken,
        //collapse_key: 'your_collapse_key',
        notification: {
            title: 'Match Start',
            body: objMatch.localteam_name + ' v/s ' + objMatch.visitorteam_name + ' - ' + objMatch.match_date,
            click_action: "FCM_PLUGIN_ACTIVITY",
            icon: ""
        },
        data: { //you can send only notification or only data(or include both)
            action_id: objMatch.id,
            action: "Match Start"
        }
    };

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something went wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    })

}

//var socket = ioClient.connect('http://localhost:8080');
var socket = ioClient.connect('http://206.189.161.54:8080');
socket.on("pushnotification", function (data) {
    var pushdata = data.data.pushdata[0];
    var matchdata = data.data.matchdata;
    //console.log(pushdata.match_id);
    //console.log(matchdata);

    if (pushdata.comments != undefined && pushdata.comments != null && pushdata.comments != '') {

        if (pushdata.comments.length > 1) {
            var comments_id = '';
            var comments_message = '';

            if (pushdata.comments.length > 0 && pushdata.comments[0].isgoal == 1) {
                comments_id = pushdata.comments[0].id;
                comments_message = pushdata.comments[0].comment;
            }

            if (pushdata.comments.length > 1 && pushdata.comments[1].isgoal == 1) {
                comments_id = pushdata.comments[1].id;
                comments_message = pushdata.comments[1].comment;
            }

            if (pushdata.comments.length > 2 && pushdata.comments[2].isgoal == 1) {
                comments_id = pushdata.comments[2].id;
                comments_message = pushdata.comments[2].comment;
            }

            if (pushdata.comments.length > 3 && pushdata.comments[3].isgoal == 1) {
                comments_id = pushdata.comments[3].id;
                comments_message = pushdata.comments[3].comment;
            }

            if (pushdata.comments.length > 4 && pushdata.comments[4].isgoal == 1) {
                comments_id = pushdata.comments[4].id;
                comments_message = pushdata.comments[4].comment;
            }

            if (pushdata.match_id != '' && pushdata.match_id != null && pushdata.match_id != undefined) {
                if (comments_id != '' && comments_id != null && comments_id != undefined) {

                    dbo.collection("notifications").find({
                        $and: [{
                            match_id: pushdata.match_id
                        }, {
                            comments_id: comments_id
                        }]
                    }, {
                        "_id": 1
                    }).toArray(function (err, data) {
                        //console.log(data.length);

                        if (data.length == 0) {
                            var obj = {
                                match_id: pushdata.match_id,
                                comments_id: comments_id
                            }

                            dbo.collection("notifications").insertOne(obj, function (err, result) {
                                if (err) throw err;
                            });

                            var condition = "'" + matchdata.localteam_id + "' in topics || " + "'" + matchdata.visitorteam_id + "' in topics";
                            //var condition = "'6468' in topics || '9002' in topics";
                            //console.log("'dogs' in topics || 'cats' in topics");
                            console.log(condition);

                            var options = {
                                uri: 'https://fcm.googleapis.com/fcm/send',
                                method: 'POST',
                                headers: {
                                    'Authorization': 'key=AIzaSyD-cZhWg_Hju8CUPrpPfHRGeP3jdYhJo7w',
                                    'Content-Type': 'application/json'
                                },
                                json: {
                                    "condition": condition,
                                    data: { //you can send only notification or only data(or include both)
                                        "title": "",
                                        "body": comments_message,
                                        "action_id": matchdata.id,
                                        "action": "Goal Score"
                                    }
                                }
                            };

                            request(options, function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    // request was success, should early return response to client
                                    // res.sendStatus(200);
                                    console.log("Sent push notification");
                                } else {
                                    //res.sendStatus(500);
                                    console.log(error);
                                }
                                console.log(body);
                                // extract invalid registration for removal
                                // if (body.failure > 0 && Array.isArray(body.results) && results.length == tokens.length) {
                                //     var tokenToBeRemoved = [];
                                //     var results = body.results;
                                //     for (var i = 0; i < tokens.length; ++i) {
                                //         if (results[i].error == 'InvalidRegistration') {
                                //             tokenToBeRemoved.push(tokens[i].token);
                                //         }
                                //     }
                                //     if (tokenToBeRemoved.length > 0) {

                                //     }
                                // }
                            });

                            // dbo.collection("users").find({
                            //     $and: [{
                            //         notification: "true"
                            //     }],
                            //     $or: [{
                            //             favoriteteam: {
                            //                 $regex: "(?<=,|^)(\s*)" + matchdata.localteam_id + "(?=\s*,|\s*$)"
                            //             }
                            //         },
                            //         {
                            //             favoriteteam: {
                            //                 $regex: "(?<=,|^)(\s*)" + matchdata.visitorteam_id + "(?=\s*,|\s*$)"
                            //             }
                            //         }
                            //     ]
                            // }).toArray(function (err, resObj) {

                            //     console.log(resObj.map(token => token.firebasetoken));
                            // })

                        } else {
                            console.log("Push Notification is already sent for comments id: " + comments_id);
                            console.log("Push Notification is already sent for match id: " + pushdata.match_id);
                        }

                    });

                } else {
                    console.log("Comments id is undefined");
                }

            }
        } else {
            console.log("Comments not Found!!!");
        }

    } else {
        console.log("Comments not available!!!");
    }




});

module.exports = router