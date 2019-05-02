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
 *   Facility:
 *     properties:
 *       roomId:
 *         type: string
 *       roomName:
 *         type: string
 *       roomNumber:
 *         type: string
 *       roomType:
 *         type: string
 *       buildingId:
 *         type: string
 *       buildingName:
 *         type: string
 *       buildingCode:
 *         type: string
 *       campusName:
 *         type: string
 *       isActive:
 *         type: boolean
 *       index:
 *         type: integer
*/

/**
 * @swagger
 * /facilities/campus:
 *   get:
 *     tags:
 *       - facilities
 *     description: Returns all campuses
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of campuses
 *         schema:
 *           $ref: '#/definitions/Campus'
 */
router.get('/campus', (req, res, next) => {

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const campusUrl = config.defaultApi.url + config.defaultApi.campusEndpoint
    +'_dc=1523226229268'
    +'&fields=Id%2CName%2CIsActive'
    +'&_s=1'
    +'&sortOrder=Name'
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
        axios.get(campusUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {          
          let campusData = response.data.data;
          let allCampuses = []; 
          for (let i = 0; i < campusData.length; i++) {
            allCampuses[i] = {};
            allCampuses[i].campusId = campusData[i][0];
            allCampuses[i].campusName = campusData[i][1];
            allCampuses[i].isActive = campusData[i][4];
            allCampuses[i].index = i;
          }
          res.setHeader('Content-Type', 'application/json');
          res.send(allCampuses);
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
    +'&fields=Id%2CName%2CBuildingCode%2CCampus.Name%2CIsActive'
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
            allBuildings[i].buildingCode = buildingData[i][2];
            allBuildings[i].campusName = buildingData[i][3];
            allBuildings[i].isActive = buildingData[i][4];
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


/**
 * @swagger
 * /facilities/rooms:
 *   get:
 *     tags:
 *       - facilities
 *     description: Returns all rooms
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of rooms
 *         schema:
 *           $ref: '#/definitions/room'
 */
router.get('/rooms', (req, res, next) => {

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const roomsUrl = config.defaultApi.url + config.defaultApi.roomsEndpoint
    +'_dc=1523226229268'
    +'&fields=Id%2CName%2CroomNumber%2CRoomType.Name%2CBuilding.Name%2CBuilding.BuildingCode%2CMaxOccupancy%2CIsActive'
    +'&_s=1'
    +'&sortOrder=Building.Name%2CName'
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
        axios.get(roomsUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {          
          let roomData = response.data.data;
          let allrooms = []; 
          for (let i = 0; i < roomData.length; i++) {
            allrooms[i] = {};
            allrooms[i].roomId = roomData[i][0];
            allrooms[i].roomName = roomData[i][1];
            allrooms[i].roomNumber = roomData[i][2];
            allrooms[i].roomType = roomData[i][3];
            allrooms[i].buildingName = roomData[i][4];
            allrooms[i].buildingCode = roomData[i][5];
            allrooms[i].maxOccupancy = roomData[i][6];
            allrooms[i].isActive = roomData[i][7];
            allrooms[i].index = i;
          }
          res.setHeader('Content-Type', 'application/json');
          res.send(allrooms);
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
