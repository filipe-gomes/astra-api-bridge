'use strict';

let assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);
const moment = require('moment');


var cfirst = moment().format('YYYY-MM-DDT08:00:00');
var clast = moment().format('YYYY-MM-DDT19:30:00');

describe('/GET all conflicting activities by datetime range', () => {
  var conflicts = '';
  it('it should GET all the conflicting activities in friendly JSON', (done) => {
    chai.request(app)
      .get('/activities/findConflicts?start='+cfirst+'&end='+clast)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        let conflictdata = res.body;
        for (let i = 0; i < conflictdata.length; i++) {
          if (i == conflictdata.length-1){
            conflicts += conflictdata[i].roomId;
          }
          else{conflicts += conflictdata[i].roomId+',';  
          }
        }
        done();
      });
  }).timeout(15000);
  
  it('should GET all the rooms in friendly JSON', (done) => {
    chai.request(app)
      .get('/facilities/availroomslist?Conflicts='+conflicts)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);

});


