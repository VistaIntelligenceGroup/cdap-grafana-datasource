# cdap-grafana-datasource

CDAP datasource for Grafana


## Requirements

* [Grafana](http://grafana.org/) 4 or greater
* [CDAP](https://cask.co/products/cdap/) 4 or greater
* [Node.js](https://nodejs.org/) 6 or greater


### Node compatibility:

Some versions of Node.js may fail to build the `node-gyp` package, which this
project depends on.

This project can be built using Node.js `v6.9.1`. You can install this version
of node using [nvm](https://github.com/creationix/nvm):

```shell
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
nvm install v6.9.1
nvm use v6.9.1
nvm alias default 6.9.1
```


## Development

To checkout, build, and test:
```shell
git clone https://github.com/VistaIntelligenceGroup/cdap-grafana-datasource.git
cd cdap-grafana-datasource
npm install
npm test
```
