'use strict';

let assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);
const moment = require('moment');

var cfirst = moment().startOf('month').format('YYYY-MM-DD');
var clast = moment().endOf('month').format('YYYY-MM-DD');
var pfirst = moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD');
var plast = moment().subtract(1,'month').endOf('month').format('YYYY-MM-DD');

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
});

describe('/GET all activities by date range', () => {
  it('it should GET all the activities in the current month in friendly JSON', (done) => {
    chai.request(app)
      .get('/activities/findByDateRange?start='+cfirst+'&end='+clast)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
//        console.log(res);
      });
  }).timeout(15000);

  // done-diva 2019-04-29: todo RT, instead of hard-coding, determine current month programmatically
  it('it should GET all the activities in the previous month in friendly JSON', (done) => {
    chai.request(app)
      .get('/activities/findByDateRange?start='+pfirst+'&end='+plast)
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
      .get('/activities/filterbyActivityType?start='+cfirst+'&end='+clast+'&activitytype=SectionMeetingType&typename=LEC')
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
