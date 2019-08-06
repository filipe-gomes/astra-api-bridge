'use strict';

let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');

chai.use(chaiHttp);

describe('/GET all event types', () => {
  it('should GET all the event types in friendly JSON', (done) => {
    chai.request(app)
      .get('/activity-types/eventtypes')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
});

describe('/GET all event meeting types', () => {
  it('should GET all the event meeting types in friendly JSON', (done) => {
    chai.request(app)
      .get('/activity-types/eventmeetingtypes')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
});

describe('/GET all section meeting types', () => {
  it('should GET all the section meeting types in friendly JSON', (done) => {
    chai.request(app)
      .get('/activity-types/meetingtypes')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
});