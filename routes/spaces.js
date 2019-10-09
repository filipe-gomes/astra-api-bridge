var express = require('express');
var router = express.Router();
const config = require('../config');
const ReadQueryBuilder = require('../utility/queryBuilderGet');
const QueryTypeEnum = require('../utility/queryTypeEnum');
const CredentialedQuery = require('../utility/credentialedQuery');

/**
 * @swagger
 * /spaces/rooms/availibility:
 *   get:
 *     tags:
 *       - rooms
 *     description: Returns all rooms and whether they availible for the entire time specified
 *     parameters:
 *       - name: start
 *         description: The beginning date and time 
 *         in: query
 *         required: true
 *         type: string
 *         format: date
 *       - name: end
 *         description: The ending date and time
 *         in: query
 *         required: true
 *         type: string
 *         format: date
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of rooms with their availability specified
 *         schema:
 *           $ref: '#/definitions/Room'
 */
router.get('/rooms/availability', (req, res, next) => {

  // implementation notes: this is a two step process: 
  // 1) get a list of all rooms available at all for the date(s) 
  // 2) find rooms that are unavailable during the actual meeting time

  let filterStartDate = req.query.start;
  let filterEndDate = req.query.end;

  if (!filterStartDate || !filterEndDate) {
    res.sendStatus(400);
  } else {
    var qb = new ReadQueryBuilder();
    qb.sort = '%2BBuilding.Name,Name';
    qb.queryType = QueryTypeEnum.ADVANCED;  
    qb.limit = 500;
    // todo RT extend comparison operations in query builder so we can use paramterized field/value pairs instead of this hacky 'advanced' version: 
    var start = `EffectiveStartDate<="${filterStartDate}"`;
    var end = `EffectiveEndDate>="${filterEndDate}"`;
    var doNotSchedule = 'DoNotSchedule == 0';

    qb.advancedFilter = encodeURIComponent(end + '&&' +  start + '&&' + doNotSchedule);

    const roomsUrl = config.defaultApi.url + config.defaultApi.roomSearchEndpoint + qb.toQueryString()

      var cq = new CredentialedQuery();
      cq.get(roomsUrl, res).then(function (response) {
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

        // step 2 is to find conflicting activities so we can mark those rooms as not available
        //var secondQuery = new ReadQueryBuilder();
        // temporary hack
        let end2 = encodeURIComponent(filterStartDate); 
        let start2 = encodeURIComponent(filterEndDate);
        let secondaryQuery = 'start=0&limit=500&isForWeekView=false' + 
          '&fields=ActivityId%2CActivityPk%2CActivityName%2CParentActivityId%2CParentActivityName%2CMeetingType%2CDescription%2CStartDate%2CEndDate%2CDayOfWeek%2CStartMinute%2CEndMinute%2CActivityTypeCode%2CResourceId%2CCampusName%2CBuildingCode%2CRoomNumber%2CRoomName%2CLocationName%2CInstitutionId%2CSectionId%2CSectionPk%2CIsExam%2CIsCrosslist%2CIsAllDay%2CIsPrivate%2CEventId%2CEventPk%2CCurrentState%2CNotAllowedUsageMask%2CUsageColor%2CUsageColorIsPrimary%2CEventTypeColor%2CMaxAttendance%2CActualAttendance%2CCapacity' + 
          '&entityProps=&_s=1' + 
          `&filter=(((StartDate%3C%22${start2}%22)%26%26(EndDate%3E%22${end2}%22))%26%26((NotAllowedUsageMask%3D%3Dnull)%7C%7C((NotAllowedUsageMask%268)%3D%3D8)))` +
          '&sortOrder=%2BStartDate%2C%2BStartMinute&page=1&group=%7B%22property%22%3A%22StartDate%22%2C%22direction%22%3A%22ASC%22%7D&sort=%5B%7B%22property%22%3A%22StartDate%22%2C%22direction%22%3A%22ASC%22%7D%2C%7B%22property%22%3A%22StartMinute%22%2C%22direction%22%3A%22ASC%22%7D%5D'

        const url = config.defaultApi.url + config.defaultApi.calendarWeekGridEndpoint + secondaryQuery;
        cq.get(url, res).then(function (response) {
          res.setHeader('Content-Type', 'application/json');
          res.send(allrooms);

          // todo need to mark off the unavailable rooms
        })
        .catch(function(error) {
          res.send(error);
        })
      }).catch(function (error) {
        res.send(error);
      });
    }
});

module.exports = router;
