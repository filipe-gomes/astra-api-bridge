"use strict";

var axios = require('axios'); // remove this after outsourcing credentialed queries
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const config = require('../config');

module.exports = class CredentialedQuery {

  constructor() {}

  get(url, res) {

    var promise = new Promise(function (resolve, reject) {

      const logonUrl = config.defaultApi.url + config.defaultApi.logonEndpoint;

      const credentialData = {
        username: config.defaultApi.username,
        password: config.defaultApi.password,
      };

      // does this have to be here??? 
      axiosCookieJarSupport(axios);
      const cookieJar = new tough.CookieJar();
      // could cookieJar be a member, and if so, would that avoid having to make a login call everytime

      axios.post(logonUrl, credentialData, {
        jar: cookieJar,
        headers: {
            withCredentials: true,
        }
      }).then(function (response) {
        if (response.data !== true) {
          res.sendStatus(401);
          reject('Login request failed'); // need test
        } else {
          cookieJar.store.getAllCookies(function (err, cookies) {
            if (cookies === undefined) {
              res.send('failed to get cookies after login');
              reject('Cookie error'); // need test
            } else {
              axios.get(url, {
                jar: cookieJar,
                headers: {
                  cookie: cookies.join('; ')
                }
              }).then(function (response) {
                resolve(response);
              }).catch(function (error) {
                res.send('respond with a resource - error ' + error);
                reject('failed axios get call');
              });
            }
          });
        }
      }).catch(function (error) {
        reject('respond with a resource - error ' + error);
      });
    });

    return promise;
  }
}