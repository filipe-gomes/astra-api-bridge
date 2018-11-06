var express = require('express');
var router = express.Router();
var axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const config = require('../config');

/* GET activites. */
router.get('/all', (req, res, next) => {

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activitiesUrl = config.defaultApi.url + config.defaultApi.activityListEndpoint
    +'_dc=1523226229268'
    +'&allowUnlimitedResults=true'
    +'&fields=ActivityId%2CActivityName%2CStartDate%2CActivityTypeCode%2CCampusName%2CBuildingCode%2CRoomNumber%2CLocationName%2CStartDateTime%2CEndDateTime%2CInstructorName%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)%2CDays%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)%2CCanView%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)%2CSectionId%2CEventId%2CEventImage%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)%2CParentActivityId%2CParentActivityName'
    +'&entityProps='
    +'&_s=1'
    +'&filter=((EventMeetingByActivityId.Event.EventTypeId%20in%20(%2287d1fd31-ed30-4d72-afc4-b9ccca353d17%22%2C%2233190952-df04-4afa-bbf1-fa923307d376%22%2C%22d9a038cb-07b8-4dff-93db-9bb40bfa3bb8%22%2C%222fe1a011-fae4-40e4-a8ba-eb13e9377abd%22%2C%222e668140-8a52-4b87-9d8c-6cbd21b00f88%22%2C%22e1b72515-5b52-48ef-8c9d-bcf0496160f9%22%2C%22d93c1faa-dd70-4d5f-a440-fd59a832538e%22%2C%22c113ecc2-22f4-4df5-b761-71bdd5a0db62%22%2C%22c6984173-d2ba-418f-9680-19ff40ee8732%22%2C%222ace0010-a887-47f0-af2a-163ae303e7de%22%2C%223475b814-f76a-42a5-bf37-2cacce11b5e5%22%2C%22fd907c3d-ef0a-4855-9fff-cde983890d0f%22%2C%22de84148d-6920-482b-bb5e-07b3e1b728d9%22%2C%2209e14c46-a5d0-462f-aff1-c06ade5a771f%22))%26%26((ActivityTypeCode%3D%3D2)%26%26(StartDateTime%20%3E%3D%20%222018-04-08T00%3A00%3A00%22%20%26%26%20StartDateTime%20%3C%3D%20%222018-05-09T23%3A59%3A59%22)))'
    +'&sortOrder=%2BStartDateTime'
    +'&page=1'
    +'&start=0'
    +'&limit=20'
    +'&sort=%5B%7B%22property%22%3A%22StartDateTime%22%2C%22direction%22%3A%22ASC%22%7D%5D';

  const credentialData = {
    username: config.defaultApi.username,
    password: config.defaultApi.password,
  };

  axiosCookieJarSupport(axios);
  const cookieJar = new tough.CookieJar();

  axios.post(logonUrl, credentialData, {
      jar: cookieJar,
      headers: {
        withCredentials: true,
      }
  }).then(function (response) {
    if (response.data !== true) {
      res.sendStatus(401);
    }
    cookieJar.store.getAllCookies(function(err, cookies) {
      if (cookies === undefined) {
        res.send('failed to get cookies after login');
      } else {
        axios.get(activitiesUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {
          let fieldList = response.data.fields.split(",");
          let activityData = response.data.data;
          let allActivities = [];
          for (let i = 0; i < activityData.length; i++) {
            allActivities[i] = {}
            for (let j = 0; j < fieldList.length; j++) {
              allActivities[i][fieldList[j]] = activityData[i][j];
            }
          }
          res.setHeader('Content-Type', 'application/json');
          res.send(allActivities);
        }).catch(function (error) {
          res.send('respond with a resource - error ' + error);
        });
      }
    });
  })
  .catch(function (error) {
    res.send('respond with a resource - error ' + error);
  });
});

module.exports = router;
