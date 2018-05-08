var router = express.Router();
var assert = require('assert');

// End Get First Time All competitions 

router.get('/SetAllCompetitions', function (req, res) {

    request(API_Url + 'competitions' + token, function (err, res1, body) {
        var obj = JSON.parse(body);
        var i = 0;

        function uploader(i) {
            if (i < obj.length) {
                dbo.collection("competitions").findOne({
                    id: obj[i].id
                }, function (err, result) {
                    assert.equal(null, err);
                    if (!result) {
                        dbo.collection("competitions").insertOne(obj[i], function (err, result) {
                            if (err) throw err;
                            if ((i + 1) == obj.length) {
                                response = {
                                    "error": "done"
                                };
                                res.json(response);
                            } else {
                                uploader(i + 1);
                            };
                        });
                    } else {
                        uploader(i + 1);
                    }
                });
            }
        }
        uploader(i);

    });



})


router.get('/SetCompetitionStanding', function (req, res) {

    dbo.collection("competitions").find({
        id: "1056"
    }).toArray(function (err, data) {
        // Mongo command to fetch all data from collection.
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            var i = 0;
            //console.log(data.length);
            function uploader(i) {
                if (i < data.length) {
                    //console.log(i);
                    request(API_Url + 'standings/' + data[i].id + token, function (err, res1, body) {
                        var ObjData = JSON.parse(body);
                        if (ObjData != null) {
                            console.log(ObjData.length);
                            if (ObjData[0]) {
                                //console.log(data[i].id);

                                var myquery = {
                                    comp_id: ObjData[0].comp_id
                                };
                                //var obj = ObjData[0];

                                dbo.collection("competition_standing").findOne(myquery, function (err, result) {
                                    if (err) throw err;
                                    if (result) {
                                        //Delete 
                                        console.log("Inside the Delete");
                                        dbo.collection("competition_standing").deleteMany(myquery, function (err, obj) {
                                            if (err) throw err;
                                            //console.log("1 document deleted");
                                            dbo.collection("competition_standing").insert(ObjData, function (err, result) {
                                                if (err) throw err;
                                                console.log("Insert");
                                                if ((i + 1) == data.length) {
                                                    response = {
                                                        "error": false
                                                    };
                                                    res.json(response);
                                                } else {
                                                    uploader(i + 1);
                                                };
                                            });
                                            //uploader(i + 1);
                                        });
                                    } else {
                                        //insert
                                        console.log("Inside Insert");
                                        // ObjData.createddate = new Date();
                                        dbo.collection("competition_standing").insert(ObjData, function (err, result) {
                                            if (err) throw err;
                                            if ((i + 1) == data.length) {
                                                console.log("Competition_Standing inserted");
                                                response = {
                                                    "error": false
                                                };
                                                res.json(response);
                                            }
                                        });
                                        uploader(i + 1);
                                    }
                                });
                            } else {
                                uploader(i + 1);
                            }

                        }
                    });
                }
            }
            uploader(i);
        }
    });
});

router.get('/SetTeam', function (req, res) {

    dbo.collection("competition_standing").find().toArray(function (err, data) {
        if (err) throw err;
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            var i = 0;

            function uploader(i) {
                if (i < data.length) {

                    request(API_Url + 'team/' + data[i].team_id + token, function (err, res1, body) {

                        var ObjData = JSON.parse(body);
                        if (ObjData != null) {
                            var myquery = {
                                team_id: ObjData.team_id
                            };

                            dbo.collection("team").findOne(myquery, function (err, result) {
                                assert.equal(null, err);
                                if (!result) {
                                    dbo.collection("team").insertOne(ObjData, function (err, result) {
                                        if (err) throw err;
                                        if ((i + 1) == data.length) {
                                            response = {
                                                "error": false
                                            };
                                            res.json(response);
                                        } else {
                                            uploader(i + 1);
                                        };
                                    });
                                } else {
                                    uploader(i + 1);
                                }
                            });
                        }

                    });
                }
            }
            uploader(i);

        }
    });

});


router.get('/SetPlayerProfile', function (req, res) {

    dbo.collection("team").find().toArray(function (err, data) {
        if (err) throw err;
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {

            var i = 0;

            function uploader(i) {
                if (i < data.length) {
                    var j = 0;

                    function uploader1(j) {

                        if (data[i].squad) {
                            if (data[i].squad.length > 0) {
                                if (j < data[i].squad.length) {

                                    request(API_Url + 'player/' + data[i].squad[j].id + token, function (err, res1, body) {

                                        if (isJSON(body)) {
                                            var ObjData = JSON.parse(body);
                                            var myquery = {
                                                id: ObjData.id
                                            };

                                            dbo.collection("player_profile").findOne(myquery, function (err, result) {
                                                assert.equal(null, err);

                                                //console.log(result.id);


                                                if (!result.id) {

                                                    console.log("Insert Record: " + data[i].squad[j].id);

                                                    dbo.collection("player_profile").insertOne(ObjData, function (err, result) {
                                                        if (err) throw err;
                                                        if ((j + 1) == data[i].squad.length) {

                                                            console.log("Total number of loop: " + j);

                                                            // if ((i + 1) == data[i].squad.length) {
                                                            //     console.log("Done Data for Player Profile");
                                                            //     response = {
                                                            //         "error": false,
                                                            //         "message": "Player Profile Created successfully..."
                                                            //     };
                                                            //     res.json(response);
                                                            // } else {
                                                            //     uploader(i + 1);
                                                            // }

                                                            uploader(i + 1);

                                                        } else {
                                                            uploader1(j + 1);
                                                        };
                                                    });

                                                } else {
                                                    console.log("Record Available!!! " + data[i].squad[j].id);
                                                    uploader1(j + 1);
                                                }
                                            });

                                        } else {
                                            console.log("Invalid Json");
                                            uploader1(j + 1);
                                        }
                                    });
                                } else {
                                    uploader(i + 1);
                                }

                            } else {
                                uploader(i + 1);
                            }
                        } else {
                            uploader(i + 1);
                        }

                    }
                    uploader1(j);
                }
            }
            uploader(i);

        }
    });

});

router.get('/SetPlayerProfilePagination', function (req, res) {

    var pageNo = parseInt(req.query.pageNo)
    var size = parseInt(req.query.size)
    var query = {}
    if (pageNo < 0 || pageNo === 0) {
        response = {
            "error": true,
            "message": "invalid page number, should start with 1"
        };
        return res.json(response)
    }
    query.skip = size * (pageNo - 1)
    query.limit = size

    dbo.collection("team").count({}, function (err, totalCount) {
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            }
        }

        dbo.collection("team").find().skip(query.skip).limit(query.limit).toArray(function (err, data) {

            var i = 0;

            function uploader(i) {
                if (i < data.length) {
                    var j = 0;

                    function uploader1(j) {

                        if (data[i].squad) {
                            console.log("----");
                            if (data[i].squad.length > 0) {
                                console.log("***");
                                if (j < data[i].squad.length) {
                                    console.log("$$$$$");

                                    request(API_Url + 'player/' + data[i].squad[j].id + token, function (err, res1, body) {

                                        if (isJSON(body)) {
                                            var ObjData = JSON.parse(body);
                                            var myquery = {
                                                id: ObjData.id
                                            };

                                            dbo.collection("player_profile").findOne(myquery, function (err, result) {
                                                assert.equal(null, err);
                                                if (!result) {

                                                    console.log("Insert Record: " + data[i].squad[j].id);

                                                    dbo.collection("player_profile").insertOne(ObjData, function (err, result) {
                                                        if (err) throw err;
                                                        if ((j + 1) == data[i].squad.length) {

                                                            console.log("Total number of loop: " + j);

                                                            if ((i + 1) == data[i].squad.length) {
                                                                console.log("Done Data for Player Profile");
                                                                var totalPages = Math.ceil(totalCount / size)
                                                                response = {
                                                                    "error": false,
                                                                    "message": "Player Profile Created successfully...",
                                                                    "pages": totalPages
                                                                };
                                                                res.json(response);
                                                            } else {
                                                                uploader(i + 1);
                                                            }

                                                        } else {
                                                            uploader1(j + 1);
                                                        };
                                                    });
                                                } else {
                                                    console.log("Record Available!!! " + data[i].squad[j].id);
                                                    uploader1(j + 1);
                                                }
                                            });

                                        } else {
                                            console.log("Invalid Json");
                                            uploader1(j + 1);
                                        }
                                    });
                                } else {
                                    uploader(i + 1);
                                }

                            } else {
                                uploader(i + 1);
                            }
                        } else {
                            uploader(i + 1);
                        }

                    }
                    uploader1(j);
                }
            }
            uploader(i);

        });


    });


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

function miliseconds(hrs, min, sec) {
    return ((hrs * 60 * 60 + min * 60 + sec) * 1000);
}

router.get('/SetMatch', function (req, res) {

    dbo.collection("competitions").find().toArray(function (err, data) {
        // Mongo command to fetch all data from collection.
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            var i = 0;

            function uploader(i) {
                if (i < data.length) {

                    var path = API_Url + 'matches' + token + '&comp_id=' + data[i].id + '&from_date=01.05.2018&to_date=01.08.2018';

                    request(path, function (err, res1, body) {

                        var ObjData = JSON.parse(body);

                        if (ObjData != null) {

                            if (ObjData[0]) {
                                var myquery = {
                                    id: ObjData[0].id
                                };

                                dbo.collection("matches").findOne(myquery, function (err, result) {
                                    assert.equal(null, err);
                                    if (!result) {
                                        console.log("Insert Match");
                                        dbo.collection("matches").insert(ObjData, function (err, result) {
                                            if (err) throw err;
                                            if ((i + 1) == data.length) {
                                                console.log("Done");
                                                response = {
                                                    "error": false
                                                };
                                                res.json(response);
                                            } else {
                                                uploader(i + 1);
                                            };
                                        });
                                    } else {
                                        console.log("Match already exits");
                                        uploader(i + 1);
                                    }
                                });

                            } else {
                                uploader(i + 1);
                            }
                        }

                    });
                }


            }
            uploader(i);


        }
    });

});

router.get('/SetCommentaries', function (req, res) {

    dbo.collection("matches").find().toArray(function (err, data) {
        // Mongo command to fetch all data from collection.
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            var i = 0;

            function uploader(i) {
                if (i < data.length) {
                    request(API_Url + 'commentaries/' + data[i].id + token, function (err, res1, body) {

                        var ObjData = JSON.parse(body);
                        if (ObjData != null) {
                            if (ObjData.match_id) {
                                var myquery = {
                                    match_id: ObjData.match_id
                                };

                                dbo.collection("commentaries").findOne(myquery, function (err, result) {
                                    assert.equal(null, err);
                                    if (!result) {
                                        console.log("Inside the Insert");
                                        //Adding Socket for sent commentaries data
                                        dbo.collection("commentaries").insertOne(ObjData, function (err, result) {
                                            if (err) throw err;
                                            if ((i + 1) == data.length) {
                                                response = {
                                                    "error": false
                                                };
                                                res.json(response);
                                            } else {
                                                uploader(i + 1);
                                            };
                                        });
                                    } else {
                                        console.log("Inside the Delete");
                                        dbo.collection("commentaries").deleteOne(myquery, function (err, obj) {
                                            if (err) throw err;
                                            //console.log("1 document deleted");
                                            dbo.collection("commentaries").insertOne(ObjData, function (err, result) {
                                                if (err) throw err;
                                                if ((i + 1) == data.length) {
                                                    response = {
                                                        "error": false
                                                    };
                                                    res.json(response);
                                                } else {
                                                    uploader(i + 1);
                                                };
                                            });
                                        });
                                    }
                                });
                            } else {
                                console.log(ObjData);
                                if ((i + 1) == data.length) {
                                    response = {
                                        "error": false
                                    };
                                    res.json(response);
                                } else {
                                    uploader(i + 1);
                                };

                            }
                        }

                    });

                }
            }
            uploader(i);
        }
    });


});



module.exports = router