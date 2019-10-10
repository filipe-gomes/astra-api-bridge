'use strict';

let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');

chai.use(chaiHttp);
const moment = require('moment');

var startDate = moment().startOf('day').add(33, 'hours').format();
var endDate = moment(startDate).add(1, 'hours').format();

describe('/GET available rooms', () => {
  it('confirm failure if unspecified dates', (done) => {
    chai.request(app)
      .get('/spaces/rooms/availability') // todo RT - need to revisit the restful path
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  }).timeout(15000);

  it('confirm failure if empty start date', (done) => {
    chai.request(app)
      .get('/spaces/rooms/availability?end=' + endDate) // todo RT - need to revisit the restful path
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
      
  }).timeout(15000);

  it('confirm failure if empty end date', (done) => {
    chai.request(app)
      .get('/spaces/rooms/availability??start=' + startDate)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  }).timeout(15000);

  it('get all available rooms for today', (done) => {
    chai.request(app)
    .get('/spaces/rooms/availability?start=' + startDate + '&end=' + endDate)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  }).timeout(15000);

});

describe('/ room reservation', () => {
  it.only('POST create a room reservation for 0 minutes', (done) => {
    var reservationStart = moment().startOf('day').add(5, 'hours').format();
    var reservationEnd = reservationStart;

    chai.request(app)
    .post('/spaces/rooms/fakeRoomId/reservation?start=' + reservationStart + '&end=' + reservationEnd)
      .end((err, res) => {
        // not implemented yet, so expect that...
        res.should.have.status(501);
        done();
      });
  }).timeout(15000);

});