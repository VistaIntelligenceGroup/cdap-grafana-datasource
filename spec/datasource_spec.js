import _ from 'lodash';
import {Datasource} from "../module";
import Q from "q";

describe('CDAPDatasource', function () {
  var ctx = {};

  beforeEach(function() {
    let instanceSettings = {url: 'http://localhost:11015'};
    ctx.$q = Q;
    ctx.backendSrv = {};
    ctx.responseData = {};
    ctx.backendSrv.datasourceRequest = function(request) {
      return ctx.$q.when({data: ctx.responseData})
    };
    ctx.ds = new Datasource(instanceSettings, ctx.$q, ctx.backendSrv, null);
  });


  it('should search for tags', function(done) {
    ctx.responseData = [
      {name: 'app', value: 'foo'},
      {name: 'dataset', value: 'bar'},
      {name: 'stream', value: 'baz'}
    ];
    ctx.ds.searchForTags(['namespace:default']).then(result => {
      expect(result).to.deep.equal([
        'app:*',
        'app:foo',
        'dataset:*',
        'dataset:bar',
        'stream:*',
        'stream:baz'
      ]);
    }).then(v => done(), err => done(err));
  });


  it('should search for metrics', function(done) {
    ctx.responseData = ['foo', 'bar', 'baz'];
    ctx.ds.searchForMetrics(['namespace:default', 'app:*']).then(result => {
      expect(result).to.deep.equal(['bar', 'baz', 'foo']);
    }).then(v => done(), err => done(err));
  });


  it('should combine search requests', function(done) {
    var pendingRequest = ctx.$q.defer();
    var requestCount = 0;
    ctx.backendSrv.datasourceRequest = function(request) {
      requestCount += 1;
      return pendingRequest.promise;
    };

    var first = ctx.$q.defer();
    ctx.ds.searchForMetrics(['namespace:default', 'app:*']).then(result => {
      expect(result).to.deep.equal(['bar', 'baz', 'foo']);
      first.resolve(result);
    }).catch(err => done(err));

    var second = ctx.$q.defer();
    ctx.ds.searchForMetrics(['namespace:default', 'app:*']).then(result => {
      expect(result).to.deep.equal(['bar', 'baz', 'foo']);
      second.resolve(result);
    }).catch(err => done(err));

    pendingRequest.resolve({data: ['foo', 'bar', 'baz']});
    ctx.$q.all(pendingRequest, first, second).finally(_ => {
      expect(requestCount).to.equal(1);
      done();
    });
  });
});
