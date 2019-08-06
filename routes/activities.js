var express = require('express');
var router = express.Router();
var axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const config = require('../config');
const camelCase = require('camelcase');
const QBget = require('../utility/queryBuilderGet');

{/**swagger def
 * @swagger
 * definition:
 *   Activity:
 *     properties:
 *       activityId:
 *         type: string
 *       activityName:
 *         type: string
 *       startDate:
 *         type: string
 *         format: date
 *       activityTypeCode:
 *         type: integer
 *       campusName:
 *         type: string
 *       buildingCode:
 *         type: string
 *       roomNumber:
 *         type: string
 *       locationName:
 *         type: string
 *       startDateTime:
 *         type: string
 *         format: date-time
 *       endDateTime:
 *         type: string
 *         format: date-time
 *       instructorName:
 *         type: string
 *       days:
 *         type: string
 *       canView:
 *         type: boolean
 *       eventType:
 *         type: string
 *       eventmeetingType:
 *         type: string
 *       sectionmeetingType:
 *         type: string
 *       roomId:
 *         type: string
 */

  // todo add some of the other fields below:
  //qb.addFields([Description', 'StartDate', 'EndDate', 'StartMinute', 'EndMinute', 'StartDateTime', 'EndDateTime']);    
  //qb.addFields(['ActivityTypeCode', 'LocationId', 'CampusName', 'BuildingCode', 'RoomNumber', 'RoomName', 'LocationName']);
  //qb.addFields(['InstitutionId', 'SectionId', 'SectionPk', 'IsExam', 'IsPrivate', 'EventId', 'CurrentState']);
  //qb.addFields(['UsageColor', 'UsageColorIsPrimary', 'EventTypeColor', 'IsExam', 'IsPrivate', 'EventId', 'CurrentState']);

  // todo correct join calls in activity data
}

function createresultlist(activityData) {
  let resultlist = [];
  for (let i = 0; i < activityData.length; i++) {
    resultlist[i] = {};
    resultlist[i].activityId = activityData[i][0];
    resultlist[i].activityName = activityData[i][1];
    resultlist[i].startDate = activityData[i][2];
    resultlist[i].activityTypeCode = activityData[i][3];
    resultlist[i].campusName = activityData[i][4];
    resultlist[i].buildingCode = activityData[i][5];
    resultlist[i].roomNumber = activityData[i][6];
    resultlist[i].locationName = activityData[i][7];
    resultlist[i].startDateTime = activityData[i][8];
    resultlist[i].endDateTime = activityData[i][9];
    resultlist[i].instructorName = activityData[i][10];
    resultlist[i].days = activityData[i][11];
    resultlist[i].canView = activityData[i][12];
    resultlist[i].sectionId = activityData[i][13];
    resultlist[i].eventId = activityData[i][14];
    resultlist[i].eventImage = activityData[i][15];
    resultlist[i].parentactivityId = activityData[i][16];
    resultlist[i].parentactivityName = activityData[i][17];
    resultlist[i].eventType = activityData[i][18];
    resultlist[i].eventMeetingType = activityData[i][19];
    resultlist[i].sectionMeetingType = activityData[i][20];
    resultlist[i].roomId = activityData[i][21]
    resultlist[i].index = i;
  }
return resultlist;
}

/**
 * @swagger
 * /activities/all:
 *   get:
 *     tags:
 *       - activities
 *     description: Returns all activities, optional filter by type
 *     parameters:
 *       - name: activitycategory
 *         description: Select an activity category filter
 *         in: query
 *         enum: ["All","Academics","Events"]
 *         required: true
 *         type: string 
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
 *         description: An array of activities
 *         schema:
 *           $ref: '#/definitions/Activity'
 */
router.get('/all', (req, res, next) => {
  const activitycat = req.query.activitycategory;

  var qb = new QBget();
  qb.entity = 'activityList';
  qb.resultType = 'List';
  qb.addFields(['ActivityId', 'ActivityName', 'StartDate', 'ActivityTypeCode', 'CampusName', 'BuildingCode', 'RoomNumber']);
  qb.addFields(['LocationName', 'StartDateTime', 'EndDateTime', 'InstructorName%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['Days%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'CanView%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['SectionId', 'EventId', 'EventImage%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'ParentActivityId', 'ParentActivityName']);
  qb.addFields(['EventMeetingByActivityId.Event.EventType.Name', 'EventMeetingByActivityId.EventMeetingType.Name']);
  qb.addFields(['SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name', 'Location.RoomId']);
  //any changes to fields must also be reflected in the createresultlist function and the swagger definition above
  if (activitycat != 'All') {
    qb.addFilterField('ActivityTypeCode');
    qb.addFilterValue('1');
    if (activitycat == 'Events') { qb.filterVariable = '!='; };
  }
  qb.addFilterField(req.query.filterfields);
  qb.addFilterValue(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.filterVariable = '!=';
  };
  qb.sort = 'StartDateTime';

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activitiesUrl = config.defaultApi.url + config.defaultApi.activityListEndpoint + qb.toQueryString();

  const credentialData = {
    username: config.defaultApi.username,
    password: config.defaultApi.password,
  };
  console.log(activitiesUrl);
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
    cookieJar.store.getAllCookies(function (err, cookies) {
      if (cookies === undefined) {
        res.send('failed to get cookies after login');
      } else {
        axios.get(activitiesUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {
          let activityData = response.data.data;
          let myresults = createresultlist(activityData);
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
 * /activities/findByDateRange:
 *   get:
 *     tags:
 *       - activities
 *     description: Returns all activities in the given range
 *     parameters:
 *       - name: start
 *         description: The beginning date for a range search (inclusive)
 *         in: query
 *         required: false
 *         type: string
 *         format: date
 *       - name: end
 *         description: The end date for a range search (inclusive)
 *         in: query
 *         required: false
 *         type: string
 *         format: date
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
 *         description: An array of activities
 *         schema:
 *           $ref: '#/definitions/Activity'
 */
router.get('/findByDateRange', (req, res, next) => {
  const filterStartDate = req.query.start;
  const filterEndDate = req.query.end;

  var qb = new QBget();
  qb.resultType = 'DateRange';
  qb.entity = 'activityList';
  qb.addFields(['ActivityId', 'ActivityName', 'StartDate', 'ActivityTypeCode', 'CampusName', 'BuildingCode', 'RoomNumber']);
  qb.addFields(['LocationName', 'StartDateTime', 'EndDateTime', 'InstructorName%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['Days%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'CanView%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['SectionId', 'EventId', 'EventImage%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'ParentActivityId', 'ParentActivityName']);
  qb.addFields(['EventMeetingByActivityId.Event.EventType.Name', 'EventMeetingByActivityId.EventMeetingType.Name']);
  qb.addFields(['SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name', 'Location.RoomId']);
  //any changes to fields must also be reflected in the createresultlist function and the swagger definition above
  qb.addFilterField(req.query.filterfields);
  qb.addFilterValue(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.filterVariable = '!=';
  };
  qb.sort = 'StartDateTime';
  if (filterStartDate){
    qb.startDate = filterStartDate;
  };
  if (filterEndDate){
    qb.endDate = filterEndDate;
  };

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activitiesUrl = config.defaultApi.url + config.defaultApi.activityListEndpoint
    + qb.toQueryString();

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
    cookieJar.store.getAllCookies(function (err, cookies) {
      if (cookies === undefined) {
        res.send('failed to get cookies after login');
      } else {
        axios.get(activitiesUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {
          let activityData = response.data.data;
          let myresults = createresultlist(activityData);
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
 * /activities/filterbyActivityType:
 *   get:
 *     tags:
 *       - activities
 *     description: Returns all activities in the given range with the requested activitytype
 *     parameters:
 *       - name: start
 *         description: The beginning date for a range search (inclusive)
 *         in: query
 *         required: true
 *         type: string 
 *         format: date
 *       - name: end
 *         description: The end date for a range search (inclusive)
 *         in: query
 *         required: true
 *         type: string 
 *         format: date
 *       - name: activitytype
 *         description: Select an activitytype
 *         in: query
 *         enum: ["EventType","EventMeetingType","SectionMeetingType"]
 *         required: true
 *         type: string 
 *       - name: typename
 *         description: Enter the activitytype name (i.e. Lecture, Internal Meeting, etc.)
 *         in: query
 *         required: true
 *         type: string 
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
 *         description: An array of activities by selected date range and activitytype
 *         schema:
 *           $ref: '#/definitions/Activity'
 */
router.get('/filterbyActivityType', (req, res, next) => {
  const filterStartDate = req.query.start;
  const filterEndDate = req.query.end;
  const filterActivityType = req.query.activitytype;
  const filterTypeName = req.query.typename;

  var qb = new QBget();
  qb.resultType = 'DateRange';
  qb.entity = 'activityList';
  qb.addFields(['ActivityId', 'ActivityName', 'StartDate', 'ActivityTypeCode', 'CampusName', 'BuildingCode', 'RoomNumber']);
  qb.addFields(['LocationName', 'StartDateTime', 'EndDateTime', 'InstructorName%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['Days%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'CanView%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['SectionId', 'EventId', 'EventImage%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'ParentActivityId', 'ParentActivityName']);
  qb.addFields(['EventMeetingByActivityId.Event.EventType.Name', 'EventMeetingByActivityId.EventMeetingType.Name']);
  qb.addFields(['SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name', 'Location.RoomId']);
  //any changes to fields must also be reflected in the createresultlist function and the swagger definition above
  qb.sort = 'StartDateTime';
  if (filterStartDate){
    qb.startDate = filterStartDate;
  };
  if (filterEndDate){
    qb.endDate = filterEndDate;
  };
  if (filterActivityType == 'EventType') {
    qb.addFilterField('EventMeetingByActivityId.Event.EventType.Name');
  } else if (filterActivityType == 'EventMeetingType') {
    qb.addFilterField('EventMeetingByActivityId.EventMeetingType.Name');
  } else {
    qb.addFilterField('SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name');
  }
  qb.addFilterValue(filterTypeName);
  qb.addFilterField(req.query.filterfields);
  qb.addFilterValue(req.query.filtervalues);
  if(req.query.filtertype == 'not_equals/not_in'){
    qb.filterVariable = '!=';
  };

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activitiesUrl = config.defaultApi.url + config.defaultApi.activityListEndpoint
    + qb.toQueryString();

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
    cookieJar.store.getAllCookies(function (err, cookies) {
      if (cookies === undefined) {
        res.send('failed to get cookies after login');
      } else {
        axios.get(activitiesUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {
          let activityData = response.data.data;
          let myresults = createresultlist(activityData);
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
 * /activities/findConflicts:
 *   get:
 *     tags:
 *       - activities
 *     description: Returns all activities in the given range
 *     parameters:
 *       - name: start
 *         description: The beginning datetime (YYYY-MM-DDTHH:MM:SS)
 *         in: query
 *         required: true
 *         type: string 
 *         format: datetime
 *       - name: end
 *         description: The end date for a range search (YYYY-MM-DDTHH:MM:SS)
 *         in: query
 *         required: true
 *         type: string 
 *         format: datetime
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activities
 *         schema:
 *           $ref: '#/definitions/Activity'
 */
router.get('/findConflicts', (req, res, next) => {
  const filterStartDate = req.query.start;
  const filterEndDate = req.query.end;

  var qb = new QBget();
  qb.resultType = 'Conflicts';
  qb.entity = 'activityList';
  qb.addFields(['ActivityId', 'ActivityName', 'StartDate', 'ActivityTypeCode', 'CampusName', 'BuildingCode', 'RoomNumber']);
  qb.addFields(['LocationName', 'StartDateTime', 'EndDateTime', 'InstructorName%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['Days%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'CanView%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['SectionId', 'EventId', 'EventImage%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'ParentActivityId', 'ParentActivityName']);
  qb.addFields(['EventMeetingByActivityId.Event.EventType.Name', 'EventMeetingByActivityId.EventMeetingType.Name']);
  qb.addFields(['SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name', 'Location.RoomId']);
  //any changes to fields must also be reflected in the createresultlist function and the swagger definition above
  qb.sort = 'StartDateTime';
  if (filterStartDate){
    qb.startDate = filterStartDate;
  };
  if (filterEndDate){
    qb.endDate = filterEndDate;
  };

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activitiesUrl = config.defaultApi.url + config.defaultApi.activityListEndpoint
    + qb.toQueryString();

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
      cookieJar.store.getAllCookies(function (err, cookies) {
        if (cookies === undefined) {
          res.send('failed to get cookies after login');
        } else {
          axios.get(activitiesUrl, {
            jar: cookieJar,
            headers: {
              cookie: cookies.join('; ')
            }
          }).then(function (response) {
            let activityData = response.data.data;
            let myresults = createresultlist(activityData);
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
 * /activities/findroomConflicts:
 *   get:
 *     tags:
 *       - activities
 *     description: Returns all activities in the given range
 *     parameters:
 *       - name: start
 *         description: The beginning datetime (YYYY-MM-DDTHH:MM:SS)
 *         in: query
 *         required: true
 *         type: string 
 *         format: datetime
 *       - name: end
 *         description: The end date for a range search (YYYY-MM-DDTHH:MM:SS)
 *         in: query
 *         required: true
 *         type: string 
 *         format: datetime
 *       - name: roomId
 *         description: roomid to filter down conflict range
 *         in: query
 *         required: true
 *         type: string 
 *         format: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activities
 *         schema:
 *           $ref: '#/definitions/Activity'
 */
router.get('/findroomConflicts', (req, res, next) => {
  const filterStartDate = req.query.start;
  const filterEndDate = req.query.end;
  const filterRoomId = req.query.roomId;

  var qb = new QBget();
  qb.entity = 'activityList';
  qb.resultType = 'Conflicts';
  qb.addFields(['ActivityId', 'ActivityName', 'StartDate', 'ActivityTypeCode', 'CampusName', 'BuildingCode', 'RoomNumber']);
  qb.addFields(['LocationName', 'StartDateTime', 'EndDateTime', 'InstructorName%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['Days%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'CanView%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['SectionId', 'EventId', 'EventImage%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'ParentActivityId', 'ParentActivityName']);
  qb.addFields(['EventMeetingByActivityId.Event.EventType.Name', 'EventMeetingByActivityId.EventMeetingType.Name']);
  qb.addFields(['SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name', 'Location.RoomId']);
  //any changes to fields must also be reflected in the createresultlist function and the swagger definition above
  qb.sort = 'StartDateTime';
  if (filterStartDate){
    qb.startDate = filterStartDate;
  };
  if (filterEndDate){
    qb.endDate = filterEndDate;
  };
  if (filterRoomId) {
    qb.addFilterField('Location.RoomId');
    qb.addFilterValue(filterRoomId);
  } 

    const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
    const activitiesUrl = config.defaultApi.url + config.defaultApi.activityListEndpoint
      + qb.toQueryString();

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
      cookieJar.store.getAllCookies(function (err, cookies) {
        if (cookies === undefined) {
          res.send('failed to get cookies after login');
        } else {
          axios.get(activitiesUrl, {
            jar: cookieJar,
            headers: {
              cookie: cookies.join('; ')
            }
          }).then(function (response) {
            let activityData = response.data.data;
            let myresults = createresultlist(activityData);
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
 * /activities/filtered:
 *   get:
 *     tags:
 *       - activities
 *     description: Returns activities through the facade protocol while allowing the ability to create an advanced custom filter
 *     parameters:
 *       - name: advancedFilter
 *         description: create an activitylist filter
 *         in: query
 *         required: false
 *         type: string 
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of activities
 *         schema:
 *           $ref: '#/definitions/Activity'
 */
router.get('/filtered', (req, res, next) => {
  const advancedFilter = req.query.advancedFilter;

  var qb = new QBget();
  qb.resultType = 'Advanced';
  qb.entity = 'activityList';
  qb.addFields(['ActivityId', 'ActivityName', 'StartDate', 'ActivityTypeCode', 'CampusName', 'BuildingCode', 'RoomNumber']);
  qb.addFields(['LocationName', 'StartDateTime', 'EndDateTime', 'InstructorName%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['Days%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'CanView%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)']);
  qb.addFields(['SectionId', 'EventId', 'EventImage%3Astrjoin2(%22%20%22%2C%20%22%20%22%2C%20%22%20%22)', 'ParentActivityId', 'ParentActivityName']);
  qb.addFields(['EventMeetingByActivityId.Event.EventType.Name', 'EventMeetingByActivityId.EventMeetingType.Name']);
  qb.addFields(['SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name', 'Location.RoomId']);
  //any changes to fields must also be reflected in the createresultlist function and the swagger definition above
  qb._advancedFilter = advancedFilter;
  qb.sort = 'StartDateTime';

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const activitiesUrl = config.defaultApi.url + config.defaultApi.activityListEndpoint + qb.toQueryString();

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
    cookieJar.store.getAllCookies(function (err, cookies) {
      if (cookies === undefined) {
        res.send('failed to get cookies after login');
      } else {
        axios.get(activitiesUrl, {
          jar: cookieJar,
          headers: {
            cookie: cookies.join('; ')
          }
        }).then(function (response) {
          let activityData = response.data.data;
          let myresults = createresultlist(activityData);
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
