var express = require('express');
var router = express.Router();
var axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const config = require('../config');
const ReadQueryBuilder = require('../utility/queryBuilderGet');
const QueryTypeEnum = require('../utility/queryTypeEnum');
const EntityEnum = require('../utility/entityEnum');
const CredentialedQuery = require('../utility/credentialedQuery');

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

router.get('/rooms', (req, res, next) => {
  const activitycat = req.query.activitycategory;

  var qb = new ReadQueryBuilder();
  // todo need entity and queryType to be set???
  qb.addFields(['RowNumber', 'Id', 'RoomName', 'RoomDescription', 'RoomNumber']);
  qb.addFields(['RoomTypeName', 'BuildingCode', 'BuildingName', 'CampusName']);
  qb.addFields(['Capacity', 'BuildingRoomNumberRoomName', 'EffectiveDateId', 'CanEdit', 'CanDelete']);
  // ?todo, need to use qb.sort = '%5B%7B%22property%22%3A%22BuildingRoomNumberRoomName%22%2C%22direction%22%3A%22ASC%22%7D%5D';

  const activitiesUrl = config.defaultApi.url + config.defaultApi.roomSearchEndpoint + qb.toQueryString()
    + '&sortOrder=%2BBuildingRoomNumberRoomName&page='; // todo replace hack here by incorporating sortOrder into ReadQueryBuilder

//    const activitiesUrl = 
//    config.defaultApi.url +'~api/resources/roomlist?_dc=1567607501536&query=&entityProps=BuildingName%2CCampusName&_s=1&fields=Id%2CName%2CEffectiveParentId%2CCanRequest%2CCanSchedule&filter=(((EffectiveEndDate%3E%3D%222019-09-04T00%3A00%3A00%22)%26%26(EffectiveStartDate%3C%3D%222019-09-04T00%3A00%3A00%22)))%26%26((DoNotSchedule%20%3D%3D%200))&sortOrder=%2BName&page=1&start=0&limit=500&sort=%5B%7B%22property%22%3A%22Name%22%2C%22direction%22%3A%22ASC%22%7D%5D'
    


  var cq = new CredentialedQuery();
  cq.get(activitiesUrl, res).then(function (response) {
    // todo pars data
    console.log(response.data.data);
    let myresults = createresultlist(activityData);
    res.setHeader('Content-Type', 'application/json');
    res.send(myresults);
  }).catch(function (error) {
    res.send(error);
  });
});

module.exports = router;
