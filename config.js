require('dotenv').config();

var config = {};

config.defaultApi = {
  "url" : process.env.API_SITE || 'site',
  "username" : process.env.API_USER || 'username',
  "password" :  process.env.API_PASSWORD || 'password',
  "logonEndpoint" : 'Logon.ashx',
  "activityListEndpoint": '~api/calendar/activityList?',
  "activityTypesEndpoint": '~api/query/eventType?',
  "buildingsEndpoint": '~api/query/building?'
}

module.exports = config;
