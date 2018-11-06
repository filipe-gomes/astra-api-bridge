'use strict';

let assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('/GET all activites', () => {
  it('it should GET all the activities in friendly JSON', (done) => {
    chai.request(app)
      .get('/activities/all')
      .end((err, res) => {
        console.log(res.body);
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  });
});