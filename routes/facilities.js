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
 *   Building:
 *     properties:
 *       buildingId:
 *         type: string
 *       buildingName:
 *         type: string
 *       buildingCode:
 *         type: string
 *       campusName:
 *         type: string
 *       index:
 *         type: integer
 *
 */

/**
 * @swagger
 * /facilities/buildings:
 *   get:
 *     tags:
 *       - facilities
 *     description: Returns all buildings
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of buildings
 *         schema:
 *           $ref: '#/definitions/Building'
 */
router.get('/buildings', (req, res, next) => {

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const buildingsUrl = config.defaultApi.url + config.defaultApi.buildingsEndpoint
    +'_dc=1523226229268'
    +'&fields=Id%2CName%2CBuildingCode%2CCampus.Name'
    +'&_s=1'
    +'&sortOrder=Campus.Name%2CName'
    +'&page=1'
    +'&start=0'
    +'&limit=100';

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
        axios.get(buildingsUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {          
          let buildingData = response.data.data;
          let allBuildings = []; 
          for (let i = 0; i < buildingData.length; i++) {
            allBuildings[i] = {};
            allBuildings[i].buildingId = buildingData[i][0];
            allBuildings[i].buildingName = buildingData[i][1];
            allBuildings[i].buildingCode = buildingData[i][0];
            allBuildings[i].campusName = buildingData[i][1];
            allBuildings[i].index = i;
          }
          res.setHeader('Content-Type', 'application/json');
          res.send(allBuildings);
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
