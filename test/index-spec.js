const expect = require('chai').expect
const server = require('../routes/index');
const config = require('../config');

describe('test', () => {
  it('should return a string', () => {
    expect('ci with travis').to.equal('ci with travis');
  });

  it('should have config file', () => {
    expect(config).to.not.be.undefined;
  });

  it('should have a default api', () => {
    expect(config.defaultApi.url).to.equal('https://test.aaiscloud.com/DemoAS8Solutions');
  });

  it('should have a non-empty api username', () => {
    expect(config.defaultApi.username).to.not.be.empty;
  });

  it('should have a non-empty api password', () => {
    expect(config.defaultApi.password).to.not.be.empty;
  });

});
