var config = {};

config.defaultApi = {
  "url" : "https://test.aaiscloud.com/DemoAS8Solutions",
  "username" : process.env.API_USER || 'username',
  "password" :  process.env.API_PASSWORD || 'password',
}

module.exports = config;
