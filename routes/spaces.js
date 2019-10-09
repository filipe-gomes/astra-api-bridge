var express = require('express');
var router = express.Router();
var axios = require('axios');
const config = require('../config');
const ReadQueryBuilder = require('../utility/queryBuilderGet');
const QueryTypeEnum = require('../utility/queryTypeEnum');
const EntityEnum = require('../utility/entityEnum');
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

  const filterStartDate = '2019-10-10T00:00:00'; //req.query.start;
  const filterEndDate = '2019-10-10T00:00:00'; // req.query.end;

  // todo fail the API call if either start date or end date not specified

  var qb = new ReadQueryBuilder();
  qb.sort = '%2BBuilding.Name,Name';
  qb.queryType = QueryTypeEnum.ADVANCED;  
  qb.limit = 500;
  // todo RT extend comparison operations in query builder so we can use paramterized field/value pairs instead of this hacky 'advanced' version: 
  var start = `EffectiveStartDate>="${filterStartDate}"`;
  var end = `EffectiveEndDate>="${filterEndDate}"`;
  var doNotSchedule = 'DoNotSchedule == 0';

  qb.advancedFilter = encodeURIComponent(start + '&&' +  end + '&&' + doNotSchedule);

  // todo consider converting to:  
  // '/~api/search/room?_dc=1570564904737&start=0&limit=500&_s=1&fields=RowNumber%2CId%2CRoomName%2CRoomDescription%2CRoomNumber%2CRoomTypeName%2CBuildingCode%2CBuildingName%2CCampusName%2CCapacity%2CBuildingRoomNumberRoomName%2CEffectiveDateId%2CCanEdit%2CCanDelete&sortOrder=%2BBuildingRoomNumberRoomName&page=1&sort=%5B%7B%22property%22%3A%22BuildingRoomNumberRoomName%22%2C%22direction%22%3A%22ASC%22%7D%5D'

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
        if (i === 1) {
          console.log(roomData[i]);
        }
      }
      console.log(response.data.data.length);
      console.log(response.data.data[0]);
      res.setHeader('Content-Type', 'application/json');
      res.send(allrooms);
    }).catch(function (error) {
      res.send(error);
    });
});

module.exports = router;
