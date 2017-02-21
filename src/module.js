import {CDAPDatasource} from './datasource';
import {CDAPQueryCtrl} from './query_ctrl';

class CDAPConfigCtrl {}
CDAPConfigCtrl.templateUrl = 'partials/config.html';

class CDAPQueryOptionsCtrl {}
CDAPQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

export {
  CDAPDatasource as Datasource,
  CDAPQueryCtrl as QueryCtrl,
  CDAPConfigCtrl as ConfigCtrl,
  CDAPQueryOptionsCtrl as QueryOptionsCtrl
};
