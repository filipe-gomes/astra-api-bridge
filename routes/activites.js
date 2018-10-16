var express = require('express');
var router = express.Router();
var axios = require('axios')
const config = require('../config');

/* GET activites. */
router.get('/all', (req, res, next) => {

  const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;
  const credentialData = {
    username: config.defaultApi.username,
    password: config.defaultApi.password,
  };

  axios.post(logonUrl, credentialData, {
      headers: {
        withCredentials: true,
      }
  }).then(function (response) {
    if (response.data !== true) {
      res.sendStatus(401);
    } else {
      res.sendStatus(200);
    }
  })
  .catch(function (error) {
    res.send('respond with a resource - error ' + error);
  });
});

module.exports = router;
