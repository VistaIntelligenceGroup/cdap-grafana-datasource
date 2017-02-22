'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, CDAPDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('CDAPDatasource', CDAPDatasource = function () {
        function CDAPDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, CDAPDatasource);

          this.url = instanceSettings.url;
          this.q = $q;
          this.backendSrv = backendSrv;

          // A memo-table for search results, because searching can be painfully slow.
          // (This doesn't cache actual metric data, just tags and metric names.)
          this._metricsSearchTable = {};
        }

        _createClass(CDAPDatasource, [{
          key: 'testDatasource',
          value: function testDatasource() {
            // For now, just try searching for some tags. If that works, then assume we're good.
            return this.searchForTags().then(function () {
              return { status: 'success', message: 'Data source is working', title: 'Success' };
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(query) {
            // Convert each metric name into an object with "text" and "expandable" fields.
            return this.searchForMetrics().then(function (metrics) {
              return _.map(metrics, function (x) {
                return { text: x, expandable: false };
              });
            });
          }
        }, {
          key: 'searchForTags',
          value: function searchForTags(tags) {
            // CDAP returns a list of objects with "name" and "value" fields. We want to
            // concatenate them with ":" in the middle. But we also want to add tags with
            // "*" for the value, like "app:*".
            return this._metricsSearch('tag', tags).then(function (objs) {
              var names = _.sortBy(_.uniq(_.map(objs, function (x) {
                return x.name;
              })));
              var found = _.filter(names, function (x) {
                return x !== 'namespace';
              });
              var stars = _.map(found, function (x) {
                return { name: x, value: '*' };
              });
              return _.concat(stars, objs);
            }).then(function (objs) {
              return _.map(objs, function (x) {
                return x.name + ':' + x.value;
              });
            }).then(function (strs) {
              return _.sortBy(strs);
            });
          }
        }, {
          key: 'searchForMetrics',
          value: function searchForMetrics(tags) {
            // The results are probably already sorted. But better safe than sorry.
            return this._metricsSearch('metric', tags).then(function (strs) {
              return _.sortBy(strs);
            });
          }
        }, {
          key: 'query',
          value: function query(options) {
            // If a target is missing a refId field, then use this name.
            var defaultRefId = 'data';

            // Similarly, if a target is missing metric names, then use this one.
            var defaultMetric = 'system.dataset.store.reads';

            // Utility function to guess the resolution we should request from CDAP.
            // (The "ms" comes from options.intervalMs.)
            var guessResolution = function guessResolution(ms) {
              if (ms < 1000 * 60) {
                return '1s';
              } else if (ms < 1000 * 60 * 60) {
                return '1m';
              } else {
                return '1h';
              }
            };

            // Grafana provides timestamps that Date.parse can understand. So use that.
            // It returns the number of milliseconds since the epoch, but CDAP wants it
            // in seconds. So divide by 1000 and convert to an integer.
            var parseTime = function parseTime(x) {
              return Date.parse(x) / 1000 | 0;
            };

            // All of the targets use the same time range, so we can define this now.
            var timeRange = {
              resolution: guessResolution(options.intervalMs),
              start: parseTime(options.range.from),
              end: parseTime(options.range.to)
            };

            // Create a new object. The keys are the refId names of each target. Map
            // each target a CDAP subquery object. The subquery object has the fields
            // that CDAP requires: tags, metrics, groupBy, and timeRange.
            var data = _.fromPairs(_.map(options.targets, function (target) {
              var metrics = target.metrics || [];
              return [target.refId || defaultRefId, {
                tags: _.fromPairs(_.map(target.tags, function (str) {
                  return str.split(':');
                })),
                metrics: metrics.length ? metrics : [defaultMetric],
                groupBy: target.groups || [],
                timeRange: target.aggregate ? { aggregate: "true" } : timeRange
              }];
            }));

            // Count how often each metric appears across all our targets. This tells
            // us if we need to include a target's refId in our labels. (We omit the
            // refId unless it's required to disambiguate the results.)
            var metricCounts = {};
            _.forEach(options.targets, function (target) {
              _.forEach(_.uniq(target.metrics), function (metric) {
                if (!metricCounts[metric]) {
                  metricCounts[metric] = 1;
                } else {
                  metricCounts[metric] += 1;
                }
              });
            });

            // Request the metric data. Map each target to the corresponding response data.
            return this._cdapRequest('/v3/metrics/query', {}, data).then(function (response) {
              return { data: _.flatMap(options.targets, function (target) {
                  var refId = target.refId || defaultRefId;
                  var convertTime = function convertTime(t) {
                    // When you request the aggregate value, CDAP returns one data point
                    // at time=0. Grafana doesn't like that. So in this case, shove the
                    // data point to the end of our time range.
                    var secs = target.aggregate && t === 0 ? timeRange.end : t;

                    // Also, CDAP returns times in seconds since the epoch. Grafana wants
                    // the times in milliseconds.
                    return secs * 1000;
                  };
                  return _.map(response.data[refId].series, function (found) {
                    // We might need to prefix our metric name with some context.
                    var prefix = metricCounts[found.metricName] > 1 ? refId + ' ' : '';

                    // For each group in our target, prefix our label with the group's value.
                    _.forEach(target.groups, function (group) {
                      prefix += found.grouping[group] + ' ';
                    });

                    // The "target" seems to be the label that appears in the panel for
                    // this particular timeseries.
                    return {
                      target: prefix + found.metricName,
                      datapoints: _.map(found.data, function (pt) {
                        return [pt.value, convertTime(pt.time)];
                      })
                    };
                  });
                }) };
            });
          }
        }, {
          key: '_metricsSearch',
          value: function _metricsSearch(target, tags) {
            // Check the memo-table. (Searching for tags and metrics can be slow.)
            var table = this._metricsSearchTable;
            var key = 'metrics,' + target + ',' + (tags ? tags.join(',') : '');
            if (table[key]) {
              return table[key];
            }

            var params = { 'target': target };
            if (tags && tags.length > 0) {
              params.tag = tags;
            }
            var request = this._cdapRequest('/v3/metrics/search', params).then(function (response) {
              return response.data;
            });
            table[key] = request;
            return request;
          }
        }, {
          key: '_cdapRequest',
          value: function _cdapRequest(path, params, data) {
            return this.backendSrv.datasourceRequest({
              method: 'POST',
              url: this.url + path,
              params: params,
              data: data
            });
          }
        }]);

        return CDAPDatasource;
      }());

      _export('CDAPDatasource', CDAPDatasource);
    }
  };
});
