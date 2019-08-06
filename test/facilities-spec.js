'use strict';

let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');

chai.use(chaiHttp);

describe('/GET all campuses', () => {
  it('should GET all the campuses in friendly JSON', (done) => {
    chai.request(app)
      .get('/facilities/campuslist')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
});

describe('/GET all buildings', () => {
  it('should GET all the buildings in friendly JSON', (done) => {
    chai.request(app)
      .get('/facilities/buildinglist')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
});

describe('/GET all rooms', () => {
  it('should GET all the rooms in friendly JSON', (done) => {
    chai.request(app)
      .get('/facilities/roomlist')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
});