import _ from 'lodash';

export class CDAPDatasource {
  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.url = instanceSettings.url;
    this.q = $q;
    this.backendSrv = backendSrv;

    // A memo-table for search results, because searching can be painfully slow.
    // (This doesn't cache actual metric data, just tags and metric names.)
    this._metricsSearchTable = {};
  }

  testDatasource() {
    // For now, just try searching for some tags. If that works, then assume we're good.
    return this.searchForTags().then(function() {
      return {status: 'success', message: 'Data source is working', title: 'Success'};
    });
  }

  metricFindQuery(query) {
    // Convert each metric name into an object with "text" and "expandable" fields.
    return this.searchForMetrics()
      .then(metrics => _.map(metrics, x => ({text: x, expandable: false})));
  }

  searchForTags(tags) {
    // CDAP returns a list of objects with "name" and "value" fields. We want to
    // concatenate them with ":" in the middle. But we also want to add tags with
    // "*" for the value, like "app:*".
    return this._metricsSearch('tag', tags)
      .then(objs => {
        let names = _.sortBy(_.uniq(_.map(objs, x => x.name)));
        let found = _.filter(names, x => x !== 'namespace');
        let stars = _.map(found, x => ({name: x, value: '*'}));
        return _.concat(stars, objs);
      })
      .then(objs => _.map(objs, x => x.name + ':' + x.value))
      .then(strs => _.sortBy(strs));
  }

  searchForMetrics(tags) {
    // The results are probably already sorted. But better safe than sorry.
    return this._metricsSearch('metric', tags).then(strs => _.sortBy(strs));
  }

  query(options) {
    // If a target is missing a refId field, then use this name.
    let defaultRefId = 'data';

    // Similarly, if a target is missing metric names, then use this one.
    let defaultMetric = 'system.dataset.store.reads';

    // Utility function to guess the resolution we should request from CDAP.
    // (The "ms" comes from options.intervalMs.)
    let guessResolution = function(ms) {
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
    let parseTime = x => ((Date.parse(x) / 1000) | 0);

    // All of the targets use the same time range, so we can define this now.
    let timeRange = {
      resolution: guessResolution(options.intervalMs),
      start: parseTime(options.range.from),
      end: parseTime(options.range.to)
    };

    // Create a new object. The keys are the refId names of each target. Map
    // each target a CDAP subquery object. The subquery object has the fields
    // that CDAP requires: tags, metrics, groupBy, and timeRange.
    let data = _.fromPairs(_.map(options.targets, target => {
      let metrics = target.metrics || [];
      return [target.refId || defaultRefId, {
        tags: _.fromPairs(_.map(target.tags, str => str.split(':'))),
        metrics: metrics.length ? metrics : [defaultMetric],
        groupBy: target.groups || [],
        timeRange: target.aggregate ? {aggregate: "true"} : timeRange
      }];
    }));

    // Count how often each metric appears across all our targets. This tells
    // us if we need to include a target's refId in our labels. (We omit the
    // refId unless it's required to disambiguate the results.)
    let metricCounts = {};
    _.forEach(options.targets, target => {
      _.forEach(_.uniq(target.metrics), metric => {
        if (!metricCounts[metric]) {
          metricCounts[metric] = 1;
        } else {
          metricCounts[metric] += 1;
        }
      });
    });

    // Request the metric data. Map each target to the corresponding response data.
    return this._cdapRequest('/v3/metrics/query', {}, data).then(response => {
      return {data: _.flatMap(options.targets, target => {
        let refId = target.refId || defaultRefId;
        let convertTime = function(t) {
          // When you request the aggregate value, CDAP returns one data point
          // at time=0. Grafana doesn't like that. So in this case, shove the
          // data point to the end of our time range.
          let secs = (target.aggregate && t === 0) ? timeRange.end : t;

          // Also, CDAP returns times in seconds since the epoch. Grafana wants
          // the times in milliseconds.
          return secs * 1000;
        };
        return _.map(response.data[refId].series, found => {
          // We might need to prefix our metric name with some context.
          var prefix = metricCounts[found.metricName] > 1 ? refId + ' ' : '';

          // For each group in our target, prefix our label with the group's value.
          _.forEach(target.groups, group => {
            prefix += (found.grouping[group] + ' ');
          });

          // The "target" seems to be the label that appears in the panel for
          // this particular timeseries.
          return {
            target: prefix + found.metricName,
            datapoints: _.map(found.data, pt => [pt.value, convertTime(pt.time)])
          };
        });
      })};
    });
  }

  // Searches for tags or metrics (indicated by the target argument). Returns
  // a promise of the response data.
  _metricsSearch(target, tags) {
    // Check the memo-table. (Searching for tags and metrics can be slow.)
    let table = this._metricsSearchTable;
    let key = 'metrics,' + target + ',' + (tags ? tags.join(',') : '');
    if (table[key]) {
      return table[key];
    }

    let params = {'target': target};
    if (tags && tags.length > 0) {
      params.tag = tags;
    }
    let request = this._cdapRequest('/v3/metrics/search', params)
      .then(response => response.data);
    table[key] = request;
    return request;
  };

  // Sends a request to CDAP. Returns a promise of the response. (Note that the
  // "data" argument is optional and may be omitted.)
  _cdapRequest(path, params, data) {
    return this.backendSrv.datasourceRequest({
      method: 'POST',
      url: this.url + path,
      params: params,
      data: data
    });
  }
}
