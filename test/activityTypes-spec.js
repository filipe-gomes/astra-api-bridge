'use strict';

let assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('/GET all activity types', () => {
  it('should GET all the activity types in friendly JSON', (done) => {
    chai.request(app)
      .get('/activity-types/all')
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
      .get('/facilities/buildings')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);
});