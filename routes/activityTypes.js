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
 * /activity-types/all:
 *   get:
 *     tags:
 *       - activity-types
 *     description: Returns all activity types
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activity types
 *         schema:
 *           $ref: '#/definitions/ActivityType'
 */
router.get('/all', (req, res, next) => {

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activityTypesUrl = config.defaultApi.url + config.defaultApi.activityTypesEndpoint
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
            allEventTypes[i].id = activityTypeData[i][0];
            allEventTypes[i].description = activityTypeData[i][1];
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

module.exports = router;
