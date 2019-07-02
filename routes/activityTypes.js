var express = require('express');
var router = express.Router();
var axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const config = require('../config');
const camelCase = require('camelcase');
const QBget = require('../utility/queryBuilderGet');

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
 *     description: Returns a list of event types.  Valid filter parameters include having no filters, having a single filter value in both the filterfields and the filtervalues boxes (=), having the same number of values in each box (=), and having a single value in the filterfields box and many values in the filtervalues box ("in").
 *     parameters:
 *       - name: filterfields
 *         description: Create comma delimited string for multiple values
 *         in: query
 *         type: string 
 *       - name: filtervalues
 *         description: Create comma delimited string for multiple values
 *         in: query
 *         type: string 
 *       - name: filtertype
 *         description: Select an filtertype
 *         in: query
 *         enum: ["equals_/_in","not_equals/not_in"]
 *         type: string 
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activity types
 *         schema:
 *           $ref: '#/definitions/ActivityType'
 */
router.get('/eventtypes', (req, res, next) => {
  var qb = new QBget();
  qb.addFields(['Id', 'Name']);
  qb.sortOrder = 'Name';
  qb.resulttype = 'List';
  qb.addFilterField(req.query.filterfields);
  qb.addFilterValue(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.filtervariable = '!=';
  };

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activityTypesUrl = config.defaultApi.url + config.defaultApi.eventTypesEndpoint
  +qb.toQueryString();

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
 *     description: Returns a list of event meeting types.  Valid filter parameters include having no filters, having a single filter value in both the filterfields and the filtervalues boxes (=), having the same number of values in each box (=), and having a single value in the filterfields box and many values in the filtervalues box ("in").
 *     parameters:
 *       - name: filterfields
 *         description: Create comma delimited string for multiple values
 *         in: query
 *         type: string 
 *       - name: filtervalues
 *         description: Create comma delimited string for multiple values
 *         in: query
 *         type: string 
 *       - name: filtertype
 *         description: Select an filtertype
 *         in: query
 *         enum: ["equals_/_in","not_equals/not_in"]
 *         type: string 
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activity types
 *         schema:
 *           $ref: '#/definitions/ActivityType'
 */
router.get('/eventmeetingtypes', (req, res, next) => {
  var qb = new QBget();
  qb.addFields(['Id', 'Name']);
  qb.sortOrder = 'Name';
  qb.resulttype = 'List';
  qb.addFilterField(req.query.filterfields);
  qb.addFilterValue(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.filtervariable = '!=';
  };

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activityTypesUrl = config.defaultApi.url + config.defaultApi.eventMeetingTypesEndpoint
    +qb.toQueryString();

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
 *     description: Returns a list of section meeting types.  Valid filter parameters include having no filters, having a single filter value in both the filterfields and the filtervalues boxes (=), having the same number of values in each box (=), and having a single value in the filterfields box and many values in the filtervalues box ("in").
 *     parameters:
 *       - name: filterfields
 *         description: Create comma delimited string for multiple values
 *         in: query
 *         type: string 
 *       - name: filtervalues
 *         description: Create comma delimited string for multiple values
 *         in: query
 *         type: string 
 *       - name: filtertype
 *         description: Select an filtertype
 *         in: query
 *         enum: ["equals_/_in","not_equals/not_in"]
 *         type: string 
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activity types
 *         schema:
 *           $ref: '#/definitions/ActivityType'
 */
router.get('/meetingtypes', (req, res, next) => {
  var qb = new QBget();
  qb.addFields(['Id', 'Name']);
  qb.sortOrder = 'Name';
  qb.resulttype = 'List';
  qb.addFilterField(req.query.filterfields);
  qb.addFilterValue(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.filtervariable = '!=';
  };

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activityTypesUrl = config.defaultApi.url + config.defaultApi.meetingTypesEndpoint
    +qb.toQueryString();

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
