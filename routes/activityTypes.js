var express = require('express');
var router = express.Router();
var axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const config = require('../config');
const camelCase = require('camelcase');

/**
 * @swagger
 * definition:
 *   ActivityType:
 *     properties:
 *       activityTypeId:
 *         type: string
 *       activityTypeName:
 *         type: string
 *       index:
 *         type: integer
 */

/**
 * @swagger
 * /activity-types/eventtypes:
 *   get:
 *     tags:
 *       - activity-types
 *     description: Returns all event types
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activity types
 *         schema:
 *           $ref: '#/definitions/ActivityType'
 */
router.get('/eventtypes', (req, res, next) => {

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activityTypesUrl = config.defaultApi.url + config.defaultApi.eventTypesEndpoint
    +'_dc=1523226229268'
    +'&fields=Id%2CName'
    +'&_s=1'
    +'&sortOrder=%2BName'
    +'&page=1'
    +'&start=0'
    +'&limit=500';

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
        axios.get(activityTypesUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {          
          let activityTypeData = response.data.data;
          let allEventTypes = []; 
          for (let i = 0; i < activityTypeData.length; i++) {
            allEventTypes[i] = {};
            allEventTypes[i].activityTypeId = activityTypeData[i][0];
            allEventTypes[i].activityTypeName = activityTypeData[i][1];
            allEventTypes[i].index = i;
          }
          res.setHeader('Content-Type', 'application/json');
          res.send(allEventTypes);
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

/**
 * @swagger
 * /activity-types/eventmeetingtypes:
 *   get:
 *     tags:
 *       - activity-types
 *     description: Returns all event meeting types
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activity types
 *         schema:
 *           $ref: '#/definitions/ActivityType'
 */
router.get('/eventmeetingtypes', (req, res, next) => {

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activityTypesUrl = config.defaultApi.url + config.defaultApi.eventMeetingTypesEndpoint
    +'_dc=1523226229268'
    +'&fields=Id%2CName'
    +'&_s=1'
    +'&sortOrder=%2BName'
    +'&page=1'
    +'&start=0'
    +'&limit=500';

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
        axios.get(activityTypesUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {          
          let activityTypeData = response.data.data;
          let allEventMeetingTypes = []; 
          for (let i = 0; i < activityTypeData.length; i++) {
            allEventMeetingTypes[i] = {};
            allEventMeetingTypes[i].activityTypeId = activityTypeData[i][0];
            allEventMeetingTypes[i].activityTypeName = activityTypeData[i][1];
            allEventMeetingTypes[i].index = i;
          }
          res.setHeader('Content-Type', 'application/json');
          res.send(allEventMeetingTypes);
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

/**
 * @swagger
 * /activity-types/meetingtypes:
 *   get:
 *     tags:
 *       - activity-types
 *     description: Returns all section meeting types
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activity types
 *         schema:
 *           $ref: '#/definitions/ActivityType'
 */
router.get('/meetingtypes', (req, res, next) => {

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activityTypesUrl = config.defaultApi.url + config.defaultApi.meetingTypesEndpoint
    +'_dc=1523226229268'
    +'&fields=Id%2CName'
    +'&_s=1'
    +'&sortOrder=%2BName'
    +'&page=1'
    +'&start=0'
    +'&limit=500';

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
        axios.get(activityTypesUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {          
          let activityTypeData = response.data.data;
          let allMeetingTypes = []; 
          for (let i = 0; i < activityTypeData.length; i++) {
            allMeetingTypes[i] = {};
            allMeetingTypes[i].activityTypeId = activityTypeData[i][0];
            allMeetingTypes[i].activityTypeName = activityTypeData[i][1];
            allMeetingTypes[i].index = i;
          }
          res.setHeader('Content-Type', 'application/json');
          res.send(allMeetingTypes);
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
