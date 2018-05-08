#API List 

http://206.189.161.54:8080/MobileAPI/GetAllCompetitions

http://206.189.161.54:8080/MobileAPI/GetCompetitionStandingById
parameter: comp_id

http://206.189.161.54:8080/MobileAPI/GetTeamById
parameter: team_id

http://206.189.161.54:8080/MobileAPI/GetPlayerProfileById
parameter: player_id

http://206.189.161.54:8080/MobileAPI/GetMatchesByCompetitionId
parameter: comp_id

http://206.189.161.54:8080/MobileAPI/GetMatchesByDate
parameter: date (Date Format Must be YYYY-MM-DD)

http://206.189.161.54:8080/MobileAPI/GetMatchStatsByMatchId
parameter: match_id

http://206.189.161.54:8080/MobileAPI/GetCommentsByMatchId
parameter: match_id

http://206.189.161.54:8080/MobileAPI/CreateUser
Method : POST Body Object parameter (required): deviceId,firebasetoken,favoriteteam(is in list[] with team id),notification(true/false)

http://206.189.161.54:8080/MobileAPI/GetLineupSubByMatchId
parameter: match_id

http://206.189.161.54:8080/MobileAPI/SendPushNotificationBeforeMatchStart
SetInterval for every 1 hours to send notification