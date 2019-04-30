const expect = require('chai').expect
const server = require('../routes/index');
const config = require('../config');

describe('global and config tests', () => {
  it('should return a string', () => {
    expect('ci with travis').to.equal('ci with travis');
  });

  it('should have config file', () => {
    expect(config).to.not.be.undefined;
  });

  it('should have a non-empty api', () => {
    expect(config.defaultApi.url).to.not.be.empty;
  });

  it('should have a non-empty api username', () => {
    expect(config.defaultApi.username).to.not.be.empty;
  });

  it('should have a username read in from .env', () => {
    expect(config.defaultApi.username).to.not.equal('username');
  });

  it('should have a non-empty api password', () => {
    expect(config.defaultApi.password).to.not.be.empty;
  });

  it('should have a password read in from .env', () => {
    expect(config.defaultApi.password).to.not.equal('password');
  });

});
