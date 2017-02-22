'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryOptionsCtrl = exports.ConfigCtrl = exports.QueryCtrl = exports.Datasource = undefined;

var _datasource = require('./datasource');

var _query_ctrl = require('./query_ctrl');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CDAPConfigCtrl = function CDAPConfigCtrl() {
  _classCallCheck(this, CDAPConfigCtrl);
};

CDAPConfigCtrl.templateUrl = 'partials/config.html';

var CDAPQueryOptionsCtrl = function CDAPQueryOptionsCtrl() {
  _classCallCheck(this, CDAPQueryOptionsCtrl);
};

CDAPQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

exports.Datasource = _datasource.CDAPDatasource;
exports.QueryCtrl = _query_ctrl.CDAPQueryCtrl;
exports.ConfigCtrl = CDAPConfigCtrl;
exports.QueryOptionsCtrl = CDAPQueryOptionsCtrl;
