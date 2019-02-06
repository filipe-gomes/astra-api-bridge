'use strict';

let assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

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
      .get('/activities/findByDateRange?start=2019-02-01&end=2019-02-28')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);

  // todo RT, instead of hard-coding, determine current month programmatically
  it('it should GET all the activities in the previous month in friendly JSON', (done) => {
    chai.request(app)
      .get('/activities/findByDateRange?start=2019-01-01&end=2019-01-31')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);

});
