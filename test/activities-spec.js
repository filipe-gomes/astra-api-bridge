'use strict';

let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
const expect = require('chai').expect
const config = require('../config');

chai.use(chaiHttp);
const moment = require('moment');

var currentMonthStart = moment().startOf('month').format('YYYY-MM-DD');
var currentMonthEnd = moment().endOf('month').format('YYYY-MM-DD');
var previousMonthStart = moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD');
var previousMonthEnd = moment().subtract(1,'month').endOf('month').format('YYYY-MM-DD');

describe('/GET all activities', () => {
  it('it should GET all the activities in friendly JSON', (done) => {
    chai.request(app)
      .get('/activities/all')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);

  it('negative test to confirm error on bad password', (done) => {
    var goodPassword = config.defaultApi.password;
    var badPassword = 'BAD' + goodPassword + 'PASSWORD';
    config.defaultApi.password = badPassword;
    chai.request(app)
      .get('/activities/all')
      .end((err, res) => {
        // restore correct password so it doesn't break other tests
        config.defaultApi.password = goodPassword; 
        res.should.have.status(401);
        done();
      });      
  }).timeout(15000);
});

describe('/GET all activities by date range', () => {
  it('it should GET all the activities in the current month in friendly JSON', (done) => {
    chai.request(app)
      .get('/activities/findByDateRange?start=' + currentMonthStart + '&end=' + currentMonthEnd)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);

  it('it should GET all the activities in the previous month in friendly JSON', (done) => {
    chai.request(app)
      .get('/activities/findByDateRange?start=' + previousMonthStart + '&end=' + previousMonthEnd)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);

});

describe('/GET filtered activities', () => {
  it('it should GET all the filtered activities in friendly JSON', (done) => {
    chai.request(app)
      .get('/activities/filterbyActivityType?start=' + currentMonthStart + '&end=' + currentMonthEnd +'&activitytype=SectionMeetingType&typename=LEC')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
 
});
  
  describe('/GET all conflicting activities for a room by datetime range', () => {
    var conflicts = '';
    it('it should GET all the conflicting activities for a room in friendly JSON', (done) => {
      chai.request(app)
        .get('/activities/findroomConflicts?start=2019-05-01T13:00:00&end=2019-05-01T19:30:00&roomId=bcd22d76-ad89-49ae-9fcf-17e5184ec6e3')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          done();
        });
    }).timeout(15000);

});
