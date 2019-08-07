var express = require('express');
var router = express.Router();
var axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const config = require('../config');
const camelCase = require('camelcase');
const QBget = require('../utility/queryBuilderGet');
const QueryTypeEnum = require('../utility/queryTypeEnum');
const EntityEnum = require('../utility/entityEnum');


/**
 * @swagger
 * definition:
 *   UserSettings:
 *     properties:
 *       userSettingsId:
 *         type: string
 *       userSettingsName:
 *         type: string
 *       isDeleted:
 *         type: string
 *       index:
 *         type: integer
 */ 
 
function createresultlist(userSettingsData) {
  let resultlist = [];
  for (let i = 0; i < userSettingsData.length; i++) {
    resultlist[i] = {};
    resultlist[i].userSettingsId = userSettingsData[i][0];
    resultlist[i].userSettingsName = userSettingsData[i][1];
    resultlist[i].isdeleted = userSettingsData[i][2];
    resultlist[i].index = i;
  }
  return resultlist;
}

/**
 * @swagger
 * /userSettings/role:
 *   get:
 *     tags:
 *       - userSettings
 *     description: Returns role name(s) and id(s) based on filtered request
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
 *         description: An array of roles
 *         schema:
 *           $ref: '#/definitions/UserSettings'
 */
router.get('/role', (req, res, next) => {
  var qb = new QBget();
  qb.entity = EntityEnum.ROLE;
  qb.addFields(['Id', 'Name', 'IsDeleted']);  //any changes to fields must also be reflected in the createresultlist function and the swagger definitions above
  qb.sort = 'Name';
  qb.queryType = QueryTypeEnum.LIST;  
  qb.addFilterFields(req.query.filterfields);
  qb.addFilterValues(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.filterVariable = '!=';
  };

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const userSettingsUrl = config.defaultApi.url + config.defaultApi.roleEndpoint
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
        axios.get(userSettingsUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {          
          let userSettingsData = response.data.data;
          let myresults = createresultlist(userSettingsData);
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
 * /userSettings/permission:
 *   get:
 *     tags:
 *       - userSettings
 *     description: Returns permission name(s) and id(s) based on filtered request
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
 *         description: An array of permissions
 *         schema:
 *           $ref: '#/definitions/UserSettings'
 */
router.get('/permission', (req, res, next) => {
  var qb = new QBget();
  qb.entity = EntityEnum.PERMISSION;
  qb.addFields(['Id', 'Name']);  //any changes to fields must also be reflected in the createresultlist function and the swagger definitions above
  qb.sort = 'Name';
  qb.queryType = QueryTypeEnum.LIST;
  qb.addFilterFields(req.query.filterfields);
  qb.addFilterValues(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.filterVariable = '!=';
  };

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const userSettingsUrl = config.defaultApi.url + config.defaultApi.permEndpoint
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
        axios.get(userSettingsUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {          
          let userSettingsData = response.data.data;
          let myresults = createresultlist(userSettingsData);
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
 * /userSettings/checkpermissions:
 *   get:
 *     tags:
 *       - userSettings
 *     description: Returns permission name(s) and id(s) based on filtered request
 *     parameters:
 *       - name: permission
 *         description: enter the name of the permission
 *         in: query
 *         type: string 
 *       - name: role
 *         description: enter the name of the role
 *         in: query
 *         type: string 
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A role permission record if exists
 */
router.get('/checkpermissions', (req, res, next) => {
  var qb = new QBget();
  qb.entity = EntityEnum.PERMISSION;
  qb.addFields(['Id','Name','Roles.Id', 'Roles.Name']);  //any changes to fields must also be reflected in the createresultlist function and the swagger definitions above
  qb.sort = 'Name';
  qb.queryType = QueryTypeEnum.LIST;
  qb.addFilterFields('Roles.isdeleted'); 
  qb.addFilterValues('0'); 
  if(req.query.permission){
      qb.addFilterFields('Name');
      qb.addFilterValues(req.query.permission);
  }
  if(req.query.role){
    qb.addFilterFields('Roles.Name');
    qb.addFilterValues(req.query.role);
  }

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const userSettingsUrl = config.defaultApi.url + config.defaultApi.permEndpoint
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
        axios.get(userSettingsUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {          
          let userSettingsData = response.data.data;
          let resultlist = [];
          for (let i = 0; i < userSettingsData.length; i++) {
            resultlist[i] = {};
            resultlist[i].profileId = userSettingsData[i][0];
            resultlist[i].profileName = userSettingsData[i][1];
            resultlist[i].roleId = userSettingsData[i][2];
            resultlist[i].roleName = userSettingsData[i][3];
            resultlist[i].index = i;
          }
          res.setHeader('Content-Type', 'application/json');
          res.send(resultlist);
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
