var axios = require('axios').default;
var uuidv4 = require('uuidv4').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

/* 
ISSUES:
* Contact empty on event
* Customer empty on event
* Contact empty on meeting
* Event Type empty

*/
async function main(){
    // INPUTS
    const userEmail = 'krowan@aais.com';
    const userName = 'Kyle Rowan';
    const eventName = 'Outlook Test Meeting 7';
    const from = new Date('2019-08-17 01:00:00.000');
    const to = new Date('2019-08-17 02:00:00.000');
    const roomId = '27e57397-1f8d-47e4-85f1-8963899fa0d9';

    // CONFIG
    const institutionName = 'SG86044Merced';
    const baseUrl = 'http://qeapp/SG86044Merced';
    const username = 'sysadmin'; // I think this is already being config'd in the bridge API
    const password = 'apple';
    const originatingUserName = 'guest'; // we should look into creating an outlook user and config'ing that

    const startDate = from.setHours(0,0,0,0);
    const endDate = to.setHours(0,0,0,0);
    const startMinute = from.getMinutes();
    const endMinute = to.getMinutes();
    const description = `This event was created by ${userName} (${userEmail}) and automatically created here by the Ad Astra Outlook Add-in.`;
    const currentYear = new Date().getFullYear().toString();

    // Not really doing anything yet
    const customerName = 'Outlook';
    const customerContactName = 'Outlook';

    const eventId = uuidv4();
    const eventMeetingId = uuidv4();
    const eventRequestId = uuidv4();
    const eventRequestMeetingId = uuidv4();
    const eventMeetingResourceId = uuidv4();

    axios.defaults.withCredentials = true;
    axiosCookieJarSupport(axios);
    const cookieJar = new tough.CookieJar();
  
    await axios.post(`${baseUrl}/logon.ashx`, { username, password }, { jar: cookieJar }).then((response) => {
        console.log(JSON.stringify(response.data));
    }).catch((error) => { console.error(error); });

    let roomNumber = '';
    let roomName = '';
    let buildingName = '';
    let buildingCode = '';
    let campusName = '';
    let roomSisKey = '';
    await axios.get(`${baseUrl}/~api/query/room?fields=Id%2CName%2CroomNumber%2CRoomType%2EName%2CBuilding%2EName%2CBuilding%2EBuildingCode%2CMaxOccupancy%2CIsActive%2CBuilding%2ECampus%2EName%2CSisKey&filter=Id=="${roomId}"`, { jar: cookieJar }).then((response) => {
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
    await axios.get(`${baseUrl}/~api/query/EventReqForm?fields=Id,Name&filter=IsActive==1`, { jar: cookieJar }).then((response) => {
        eventRequestFormId = response.data.data[0][0];
        console.log(`eventRequestFormId = ${eventRequestFormId}`);
    }).catch((error) => { console.error(error); });

    let roomConfigurationId = '';
    await axios.get(`${baseUrl}/~api/query/roomconfiguration?fields=Id%2CIsActive&filter=RoomId=="${roomId}"%26%26IsActive==1%26%26IsDefault==1`, { jar: cookieJar }).then((response) => {
        roomConfigurationId = response.data.data[0][0];
        console.log(`roomConfigurationId = ${roomConfigurationId}`);
    }).catch((error) => { console.error(error); });

    let institutionId = '';
    await axios.get(`${baseUrl}/~api/query/organization?fields=Id,name,isactive,InstanceName`, { jar: cookieJar }).then((response) => {
        // Only pull active institutions that match the InstanceName
        response.data.data.map((institution) => {
            if (institution[3] == institutionName && institution[2]) {
                institutionId = institution[0];
            }    
        });
        console.log(`institutionId = ${institutionId}`);
    }).catch((error) => { console.error(error); });

    let currentMaxRequestNumber = 0;
    await axios.get(`${baseUrl}/~api/query/eventrequest?fields=RequestNumber&sortOrder=-RequestNumber&Limit=1`, { jar: cookieJar }).then((response) => {
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
    await axios.get(`${baseUrl}/~api/query/User?fields=Id,UserName&filter=Username%3D%3D%22${originatingUserName}%22%26%26IsActive%3D%3D1`, { jar: cookieJar }).then((response) => {
        originatingUserId = response.data.data[0][0];
        console.log(`originatingUserId = ${originatingUserId}`);
    }).catch((error) => { console.error(error); });


    let reservationNumber = '';
    await axios.get(`${baseUrl}/~api/events/GetReservationNumber`, { jar: cookieJar }).then((response) => {
        reservationNumber = response.data;
        console.log(`reservationNumber = ${reservationNumber}`);
    }).catch((error) => { console.error(error); });


    // TODO Unsure what event type to use for this - is 'Unknown' standard?
    // await axios.get(`${baseUrl}/~api/query/EventType?fields=Id,Name&filter=IsActive%3D%3D1`).data[0][0];
    let eventTypeId = null; 
    let eventTypeName = null;
    console.log(`eventTypeId = ${eventTypeId}`);
    console.log(`eventTypeName = ${eventTypeName}`);


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
                    */
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
}

main();