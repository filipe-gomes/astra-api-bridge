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

  // todo RT, instead of hard-coding, determine current month programmatically
  // done-diva 2019-04-29
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
      .get('/activities/filterbyActivityType?start='+cfirst+'&end='+clast+'&activitytype=EventType&typename=Internal Meeting')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
  
});
