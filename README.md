# cdap-grafana-datasource

CDAP datasource for Grafana


## Requirements

* [Grafana](http://grafana.org/) 4 or greater
* [CDAP](https://cask.co/products/cdap/) 4 or greater


## Usage

![Example](https://raw.githubusercontent.com/VistaIntelligenceGroup/cdap-grafana-datasource/master/docs/images/simple-example.png)

### Legend

* `CONTEXT`
** Specifies the tags for your query.
** Corresponds to the `tag` query variable in [CDAP](http://docs.cask.co/cdap/current/en/reference-manual/http-restful-api/metrics.html#querying-a-metric).
** [Available contexts](http://docs.cask.co/cdap/current/en/reference-manual/http-restful-api/metrics.html#available-contexts).
* `METRICS`
** Specifies the metrics for your query.
** Corresponds to the `metric` query variable in [CDAP](http://docs.cask.co/cdap/current/en/reference-manual/http-restful-api/metrics.html#querying-a-metric).
** [Available system metrics](http://docs.cask.co/cdap/current/en/reference-manual/http-restful-api/metrics.html#available-system-metrics).
* `GROUP BY`
** Specifies the groups for your query.
** All data points that have the same values in tags specified in this setting will form a single timeseries.
** Corresponds to the `groupBy` query variable in [CDAP](http://docs.cask.co/cdap/current/en/reference-manual/http-restful-api/metrics.html#querying-a-metric).
* `AGGREGATE`
** Instructs CDAP to return the total aggregated value for the timeseries.
** Corresponds to the `aggregate=true` option in [CDAP](http://docs.cask.co/cdap/current/en/reference-manual/http-restful-api/metrics.html#querying-a-metric).


Please see the
[CDAP Metrics documentation](http://docs.cask.co/cdap/current/en/reference-manual/http-restful-api/metrics.html)
for more details.


## Development

### Requirements

* [Node.js](https://nodejs.org/) 6 or greater

#### Node compatibility:

Some versions of Node.js may fail to build the `node-gyp` package, which this
project depends on.

This project can be built using Node.js `v6.9.1`. You can install this version
of node using [nvm](https://github.com/creationix/nvm):

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
nvm install v6.9.1
nvm use v6.9.1
nvm alias default 6.9.1
```

To checkout, build, and test:
```
# Clone from github:
git clone https://github.com/VistaIntelligenceGroup/cdap-grafana-datasource.git

# Enter the project directory:
cd cdap-grafana-datasource

# Install all the dependencies (in the node_modules directory):
npm install

# Build and run the tests:
grunt

# Alternately:
npm test
```


## Acknowledgments

This project is based on the
[hawkular-grafana-datasource](https://github.com/hawkular/hawkular-grafana-datasource)
repository.
