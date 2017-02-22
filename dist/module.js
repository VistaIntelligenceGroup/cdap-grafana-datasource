'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  "use strict";

  var CDAPDatasource, CDAPQueryCtrl, CDAPConfigCtrl, CDAPQueryOptionsCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      CDAPDatasource = _datasource.CDAPDatasource;
    }, function (_query_ctrl) {
      CDAPQueryCtrl = _query_ctrl.CDAPQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', CDAPConfigCtrl = function CDAPConfigCtrl() {
        _classCallCheck(this, CDAPConfigCtrl);
      });

      CDAPConfigCtrl.templateUrl = 'partials/config.html';

      _export('QueryOptionsCtrl', CDAPQueryOptionsCtrl = function CDAPQueryOptionsCtrl() {
        _classCallCheck(this, CDAPQueryOptionsCtrl);
      });

      CDAPQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

      _export('Datasource', CDAPDatasource);

      _export('QueryCtrl', CDAPQueryCtrl);

      _export('ConfigCtrl', CDAPConfigCtrl);

      _export('QueryOptionsCtrl', CDAPQueryOptionsCtrl);
    }
  };
});
