var express = require('express');
var router = express.Router();
var axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const config = require('../config');
const ReadQueryBuilder = require('../utility/queryBuilderGet');
const QueryTypeEnum = require('../utility/queryTypeEnum');
const EntityEnum = require('../utility/entityEnum');

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

function createresultlist(activityTypeData) {
  let resultlist = [];
  for (let i = 0; i < activityTypeData.length; i++) {
    resultlist[i] = {};
    resultlist[i].activityTypeId = activityTypeData[i][0];
    resultlist[i].activityTypeName = activityTypeData[i][1];
    resultlist[i].index = i;
  }
  return resultlist;
}

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
  var qb = new ReadQueryBuilder();
  qb.entity = EntityEnum.EVENT_TYPE;
  qb.addFields(['Id', 'Name']);  //any changes to fields must also be reflected in the createresultlist function and the swagger definitions above
  qb.sort = 'Name';
  qb.queryType = QueryTypeEnum.LIST;
  qb.addFilterFields(req.query.filterfields);
  qb.addFilterValues(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.equalityFilter = false;
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
          let myresults = createresultlist(activityTypeData);
          res.setHeader('Content-Type', 'application/json');
          res.send(myresults);
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
  var qb = new ReadQueryBuilder();
  qb.entity = EntityEnum.EVENT_MEETING_TYPE;
  qb.addFields(['Id', 'Name']);  //any changes to fields must also be reflected in the createresultlist function and the swagger definitions above
  qb.sort = 'Name';
  qb.queryType = QueryTypeEnum.LIST;
  qb.addFilterFields(req.query.filterfields);
  qb.addFilterValues(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.equalityFilter = false;
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
          let myresults = createresultlist(activityTypeData);
          res.setHeader('Content-Type', 'application/json');
          res.send(myresults);
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
  var qb = new ReadQueryBuilder();
  qb.entity = EntityEnum.MEETING_TYPE;
  qb.addFields(['Id', 'Name']); //any changes to fields must also be reflected in the createresultlist function and the swagger definitions above
  qb.sort = 'Name';
  qb.queryType = QueryTypeEnum.LIST;
  qb.addFilterFields(req.query.filterfields);
  qb.addFilterValues(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.equalityFilter = false;
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
          let myresults = createresultlist(activityTypeData);
          res.setHeader('Content-Type', 'application/json');
          res.send(myresults);
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
