"use strict";

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _module = require("../module");

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('CDAPDatasource', function () {
  var ctx = {};

  beforeEach(function () {
    var instanceSettings = { url: 'http://localhost:11015' };
    ctx.$q = _q2.default;
    ctx.backendSrv = {};
    ctx.responseData = {};
    ctx.backendSrv.datasourceRequest = function (request) {
      return ctx.$q.when({ data: ctx.responseData });
    };
    ctx.ds = new _module.Datasource(instanceSettings, ctx.$q, ctx.backendSrv, null);
  });

  it('should search for tags', function (done) {
    ctx.responseData = [{ name: 'app', value: 'foo' }, { name: 'dataset', value: 'bar' }, { name: 'stream', value: 'baz' }];
    ctx.ds.searchForTags(['namespace:default']).then(function (result) {
      expect(result).to.deep.equal(['app:*', 'app:foo', 'dataset:*', 'dataset:bar', 'stream:*', 'stream:baz']);
    }).then(function (v) {
      return done();
    }, function (err) {
      return done(err);
    });
  });

  it('should search for metrics', function (done) {
    ctx.responseData = ['foo', 'bar', 'baz'];
    ctx.ds.searchForMetrics(['namespace:default', 'app:*']).then(function (result) {
      expect(result).to.deep.equal(['bar', 'baz', 'foo']);
    }).then(function (v) {
      return done();
    }, function (err) {
      return done(err);
    });
  });

  it('should combine search requests', function (done) {
    var pendingRequest = ctx.$q.defer();
    var requestCount = 0;
    ctx.backendSrv.datasourceRequest = function (request) {
      requestCount += 1;
      return pendingRequest.promise;
    };

    var first = ctx.$q.defer();
    ctx.ds.searchForMetrics(['namespace:default', 'app:*']).then(function (result) {
      expect(result).to.deep.equal(['bar', 'baz', 'foo']);
      first.resolve(result);
    }).catch(function (err) {
      return done(err);
    });

    var second = ctx.$q.defer();
    ctx.ds.searchForMetrics(['namespace:default', 'app:*']).then(function (result) {
      expect(result).to.deep.equal(['bar', 'baz', 'foo']);
      second.resolve(result);
    }).catch(function (err) {
      return done(err);
    });

    pendingRequest.resolve({ data: ['foo', 'bar', 'baz'] });
    ctx.$q.all(pendingRequest, first, second).finally(function (_) {
      expect(requestCount).to.equal(1);
      done();
    });
  });
});
