var express = require('express');
var router = express.Router();
var async = require("async");
var uuidv4 = require('uuidv4').default;
const config = require('../config');
const ReadQueryBuilder = require('../utility/queryBuilderGet');
const QueryTypeEnum = require('../utility/queryTypeEnum');
const CredentialedQuery = require('../utility/credentialedQuery');

/**
 * @swagger
 * /spaces/rooms/availability:
 *   get:
 *     tags:
 *       - rooms
 *     description: Returns all rooms and whether they available for the entire time specified
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
        let rooms = []; 
        for (let i = 0; i < roomData.length; i++) {
          rooms[i] = {};
          rooms[i].roomId = roomData[i][0];
          rooms[i].roomBuildingAndNumber = roomData[i][1];
          rooms[i].whyIsRoomIdHereTwice = roomData[i][2];
          rooms[i].available = true; // assume this until disproven by retrieving activity list
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

          let data = response.data.data;
          let unavailableRooms = [];
          for (let i = 0; i < data.length; i++) {
            let roomId = data[i][13]
            unavailableRooms[i] = roomId;

            // this is brute force O(n^2), might want to consider a more elegant solution
            rooms.forEach(function(item, index) {
              if (item.roomId === roomId) {
                item.available = false;
              }
            })
          }
          res.send(rooms);

        })
        .catch(function(error) {
          res.send(error);
        })
      }).catch(function (error) {
        res.send(error);
      });
    }
});

/**
 * @swagger
 * /spaces/rooms/{roomId}/reservation:
 *   post:
 *     tags:
 *       - rooms
 *     description: Reserve the given room for the time duration specified
 *     parameters:
 *       - name: roomId
 *         description: Unique identifier for the room 
 *         in: query
 *         required: true
 *         type: string
 *         format: string
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
 router.post('/rooms/:id/reservation', async (req, res, next) => {
  var roomId = req.params.id;
  console.log(roomId);
  let startDate = req.query.start;
  let endDate = req.query.end;
  console.log(startDate + ' # ' + endDate);

  // INPUTS
  const userEmail = 'DemoUser@aais.com';
  const userName = 'Demo User';
  const eventName = 'Outlook Test Meeting';
  // const from = new Date('2019-08-17 01:00:00.000');
  // const to = new Date('2019-08-17 02:00:00.000');
  // const roomId = '27e57397-1f8d-47e4-85f1-8963899fa0d9';

  // CONFIG
  const institutionName = 'AS8DEMO1'; // todo RT - do we need this???????
  // const baseUrl = 'http://qeapp/SG86044Merced';
  // const username = 'sysadmin'; // I think this is already being config'd in the bridge API
  // const password = 'apple';
  const originatingUserName = 'guest'; // we should look into creating an outlook user and config'ing that

  // const startDate = from.setHours(0,0,0,0);
  // const endDate = to.setHours(0,0,0,0);
  // const startMinute = from.getMinutes();
  // const endMinute = to.getMinutes();
  const description = `This event was created by ${userName} (${userEmail}) and automatically created here by the Ad Astra Outlook Add-in.`;
  const currentYear = new Date().getFullYear().toString(); // todo RT -- why do we need this

  // Not really doing anything yet
  const customerName = 'Outlook';
  const customerContactName = 'Outlook';

  const eventId = uuidv4();
  const eventMeetingId = uuidv4();
  const eventRequestId = uuidv4();
  const eventRequestMeetingId = uuidv4();
  const eventMeetingResourceId = uuidv4();

  // axios.defaults.withCredentials = true;
  // axiosCookieJarSupport(axios);
  // const cookieJar = new tough.CookieJar();

  // await axios.post(`${baseUrl}/logon.ashx`, { username, password }, { jar: cookieJar }).then((response) => {
  //     console.log(JSON.stringify(response.data));
  // }).catch((error) => { console.error(error); });

  let roomNumber = '';
  let roomName = '';
  let buildingName = '';
  let buildingCode = '';
  let campusName = '';
  let roomSisKey = '';

  var qb = new ReadQueryBuilder();
  qb.addFields(['Id', 'Name', 'roomNumber', 'RoomType.Name', 'Building.Name', 'Building.BuildingCode']);
  qb.addFields(['MaxOccupancy', 'IsActive', 'Building.Campus.Name', 'SisKey']);
  qb.addFilterFields('Id');
  qb.addFilterValues(roomId);



  var cq = new CredentialedQuery();
  const roomLookupUrl = config.defaultApi.url + config.defaultApi.roomsEndpoint + qb.toQueryString();  
  await cq.get(roomLookupUrl, res).then(function (response) {
    console.log('#### ' + response.data.data); // todo RT remove this 
    let room = response.data.data[0];
    roomName = room[1];
    roomNumber = room[2];
    buildingName = room[4];
    buildingCode = room[5];
    campusName = room[8];
    roomSisKey = room[9];
    console.log(`roomName = ${roomName}`);
    console.log(`roomNumber = ${roomNumber}`);
    console.log(`buildingName = ${buildingName}`);
    console.log(`buildingCode = ${buildingCode}`);
    console.log(`campusName = ${campusName}`);
    console.log(`roomSisKey = ${roomSisKey}`);
  }).catch((error) => { console.error(error); });
  
  let eventRequestFormId = '';
  await cq.get(`${config.defaultApi.url}/~api/query/EventReqForm?fields=Id,Name&filter=IsActive==1`, res).then((response) => {
      eventRequestFormId = response.data.data[0][0];
      console.log(`eventRequestFormId = ${eventRequestFormId}`);
  }).catch((error) => { console.error(error); });


  let roomConfigurationId = '';
  await cq.get(`${config.defaultApi.url}/~api/query/roomconfiguration?fields=Id%2CIsActive&filter=RoomId=="${roomId}"%26%26IsActive==1%26%26IsDefault==1`, res).then((response) => {
      roomConfigurationId = response.data.data[0][0];
      console.log(`roomConfigurationId = ${roomConfigurationId}`);
  }).catch((error) => { console.error(error); });

  // todo RT - need to revisit institution Id?  
  let institutionId = '';
  await cq.get(`${config.defaultApi.url}/~api/query/organization?fields=Id,name,isactive,InstanceName`, res).then((response) => {
      // Only pull active institutions that match the InstanceName
      response.data.data.map((institution) => {
          if (institution[3] == institutionName && institution[2]) {
              institutionId = institution[0];
          }    
      });
      console.log(`institutionId = ${institutionId}`);
  }).catch((error) => { console.error(error); });

    
  let currentMaxRequestNumber = 0;
  await cq.get(`${config.defaultApi.url}/~api/query/eventrequest?fields=RequestNumber&sortOrder=-RequestNumber&Limit=1`, res).then((response) => {
      response.data.data.map((requestNumber) => {
          let year = requestNumber[0].split('-')[0];
          let number = parseInt(requestNumber[0].split('-')[1]);
          if (year == currentYear && number > currentMaxRequestNumber) {
              currentMaxRequestNumber = number;
          }
      });
      console.log(`currentMaxRequestNumber = ${currentMaxRequestNumber}`);
  }).catch((error) => { console.error(error); });

  const requestNumber = `${currentYear}-${(currentMaxRequestNumber + 1).toString().padStart(5, '0')}`;
  console.log(`requestNumber = ${requestNumber}`);

  var originatingUserId = '';
  await cq.get(`${config.defaultApi.url}/~api/query/User?fields=Id,UserName&filter=Username%3D%3D%22${originatingUserName}%22%26%26IsActive%3D%3D1`, res).then((response) => {
      originatingUserId = response.data.data[0][0];
      console.log(`originatingUserId = ${originatingUserId}`);
  }).catch((error) => { console.error(error); });


  let reservationNumber = '';
  await cq.get(`${config.defaultApi.url}/~api/events/GetReservationNumber`, res).then((response) => {
      reservationNumber = response.data;
      console.log(`reservationNumber = ${reservationNumber}`);
  }).catch((error) => { console.error(error); });


  // TODO Unsure what event type to use for this - is 'Unknown' standard?
  // await axios.get(`${baseUrl}/~api/query/EventType?fields=Id,Name&filter=IsActive%3D%3D1`).data[0][0];
  // let eventTypeId = null; 
  // let eventTypeName = null;
  // console.log(`eventTypeId = ${eventTypeId}`);
  // console.log(`eventTypeName = ${eventTypeName}`);

    res.sendStatus(501);
    /*

    const postBody = JSON.stringify({
        "EventRequest": {
            "+": [
                {
                    "Id": eventRequestId,
                    "Address1": null,
                    "Address2": null,
                    "ApproveDeclineDate": null,
                    "City": null,
                    "Country": null,
                    "County": null,
                    "CustomerContactName": customerContactName,
                    "CustomerId": null,
                    "CustomerName": "",
                    "DeclineReason": null,
                    "Description": description,
                    "Email": userEmail,
                    "EstimatedAttendance": null,
                    "EventReqFormId": eventRequestFormId,
                    "EventTypeId": eventTypeId,
                    "EventTypeName": eventTypeName,
                    "Fax": null,
                    "FirstName": null,
                    "FullName": null,
                    "InstitutionId": institutionId,
                    "IsFeaturedEvent": false,
                    "IsPrivateEvent": false,
                    "LastImportedDate": null,
                    "LastName": null,
                    "LastSisUpdateDate": null,
                    "Mobile": null,
                    "Name": eventName,
                    "Note": null,
                    "OriginatingUserId": originatingUserId,
                    "Phone": "",
                    "PrimaryCustomerContactId": null,
                    "RequestNumber": requestNumber,
                    "RequiresAttention": false,
                    "RequiresAttentionReason": null,
                    "SisKey": roomSisKey,
                    "State": null,
                    "ZipCode": null,
                    "ZipCodePlus": null
                }
            ]
        },
        "Event": {
            "+": [
                {
                    "Id": eventId,
                    "AccountingKey": null,
                    "AllowAttendeeSignUp": false,
                    "CustomerContactName": customerName,
                    "CustomerId": null, // ??
                    "CustomerName": customerName,
                    "Description": description,
                    "DoNotifyPrimaryContact": true,
                    "EditCounter": 0,
                    "EstimatedAttendance": 0,
                    "EventOwnerName": "", // ??
                    "EventRequestId": eventRequestId,
                    "EventTypeId": eventTypeId,
                    "EventTypeName": eventTypeName,
                    "ExternalDescriptionId": null,
                    "InstitutionContactId": null,
                    "InstitutionId": institutionId,
                    "IsFeatured": false,
                    "IsPrivate": false,
                    "LastImportedDate": null,
                    "LastSisUpdateDate": null,
                    "Name": "",
                    "NextMeetingNumber": 0,
                    "OwnerId": originatingUserId,
                    "PrimaryCustomerContactId": null, // Look this up?
                    "RecordableAttendeeType": null,
                    "RequiresAttention": false,
                    "RequiresAttentionReason": null,
                    "ReservationNumber": reservationNumber,
                    "SisKey": roomSisKey,
                    "StatusText": "",
                    "UploadedPictureId": null,
                    "WorkflowInstanceId": null,
                    "WorkflowIntent": "S",
                    "WorkflowIntentOwnerId": null,
                    "WorkflowState": null
                }
            ]
        },
        "EventRequestMeeting": {
            "+": [
                {
                    "Id": eventRequestMeetingId,
                    "Description": description,
                    "EndDate": endDate,
                    "EndMinute": endMinute,
                    "EventMeetingTypeId": null,
                    "EventReqMeetingGroupId": null,
                    "EventRequestId": eventRequestId,
                    "IsFeaturedEvent": false,
                    "IsPrivateEvent": false,
                    "IsRoomRequired": true,
                    "LastImportedDate": null,
                    "LastSisUpdateDate": null,
                    "MaxAttendance": null,
                    "Name": eventName,
                    "RecurrencePatternId": null,
                    "RequiresAttention": false,
                    "RequiresAttentionReason": null,
                    "RoomConfigurationId": roomConfigurationId, // Not sure if this is needed
                    "SisKey": roomSisKey,
                    "StartDate": startDate,
                    "StartMinute": startMinute
                }
            ]
        },
        "EventMeeting": {
            "+": [
                {
                    "Id": eventMeetingId,
                    "AccountingKey": null,
                    "ActualAttendance": null,
                    "BuildingRoom": `${buildingName} ${roomName}`,
                    "ConflictDesc": "",
                    "ConflictsWithHoliday": false,
                    "CustomerContactId": null, // Look this up?
                    "CustomerContactName": customerName,
                    "CustomerId": null,
                    "CustomerName": customerName,
                    "DaysMask": null,
                    "Description": null,
                    "Duration": (endMinute - startMinute),
                    "EndDate": endDate,
                    "EndMinute": endMinute,
                    "EventId": eventId,
                    "EventMeetingGroupId": null,
                    "EventMeetingTypeId": null,
                    "EventMeetingTypeName": "",
                    "EventRequestMeetingId": eventRequestMeetingId,
                    "InstitutionContactId": null,
                    "IsException": null,
                    "IsFeatured": false,
                    "IsPrivate": false,
                    "IsRoomRequired": true,
                    "IsUsageOutDated": null,
                    "LastImportedDate": null,
                    "LastSisUpdateDate": null,
                    "MaxAttendance": null,
                    "MeetingNumber": 0,
                    "Name": eventName,
                    "OwnerId": originatingUserId,
                    "RecurrencePatternId": null,
                    "RequiresAttention": false,
                    "RequiresAttentionReason": null,
                    "ResourcesSummary": "",
                    "SisKey": roomSisKey,
                    "StartDate": startDate,
                    "StartMinute": startMinute,
                    "StatusText": "",
                    "WorkflowIntent": "S",
                    "WorkflowIntentOwnerId": originatingUserId,
                    "WorkflowState": null
                }
            ]
        },
        "EventMeetingResource": {
            "+": [
                {
                    "AllowDoubleBookMask": 0,
                    "CampusName": campusName,
                    "ConflictingActivityTypeCode": 0,
                    "CreatedBy": null,
                    "Description":  `${buildingName} ${roomName}`,
                    "EventMeetingId": eventMeetingId,
                    "FailedAvailabilityCheck": false,
                    "Id": eventMeetingResourceId,
                    "ModifiedBy": null,
                    "MoveWithMeeting": true,
                    "Name": "",
                    "RequiresAttention": false,
                    "RequiresAttentionReason": null,
                    "ResourceId": roomConfigurationId,
                    "ResourceName":  `${buildingCode} ${roomNumber}`,
                    "ResourceTypeCode": 49, // 49 is the hardcoded code for the Room type
                    "SelectedQty": 1,
                    "SisKey": null,
                    "StatusText": "",
                    "UsageTypeCode": 2, // Need to look into whether this works with a request
                    /*          
                        NoUsage = 0,
                        Requested = 1,
                        Scheduled = 2,
                        ScheduledSetupTeardown = 3,
                        UsageControl = 4,
                        RequestedSetupTeardown = 5,
                        PartitionConflict = 6,
                        HolidayConflict = 7
                    * /
                    "WorkflowIntent": "S",
                    "WorkflowIntentOwnerId": originatingUserId,
                    "WorkflowState": null
                }
            ]
        }
    });
    console.log(`postBody = ${postBody}`);
    axios.post(`${baseUrl}/~api/Entity`, postBody, { jar: cookieJar }).then((response) => {
        console.log(JSON.stringify(response.data));
    }).catch((error) => { console.error(error); });
*/
});

module.exports = router;
