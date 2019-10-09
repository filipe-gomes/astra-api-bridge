'use strict';

let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
const expect = require('chai').expect
const config = require('../config');

chai.use(chaiHttp);
const moment = require('moment');

// var currentMonthStart = moment().startOf('month').format('YYYY-MM-DD');
// var currentMonthEnd = moment().endOf('month').format('YYYY-MM-DD');
// var previousMonthStart = moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD');
// var previousMonthEnd = moment().subtract(1,'month').endOf('month').format('YYYY-MM-DD');

describe('/GET available rooms', () => {
  it.only('it should GET all the rooms available in friendly JSON', (done) => {
    chai.request(app)
      .get('/spaces/rooms') // todo RT - need to revisit the restful path
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
});