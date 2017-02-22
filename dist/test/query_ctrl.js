'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CDAPQueryCtrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _sdk = require('app/plugins/sdk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// When the user adds a new tag, metric, or group, this is the label that we
// initially use. It means, "Hey, you need to pick something here."
var selectLabel = '[ select ]';

var CDAPQueryCtrl = exports.CDAPQueryCtrl = function (_QueryCtrl) {
  _inherits(CDAPQueryCtrl, _QueryCtrl);

  function CDAPQueryCtrl($scope, $injector, uiSegmentSrv, $q) {
    _classCallCheck(this, CDAPQueryCtrl);

    var _this = _possibleConstructorReturn(this, (CDAPQueryCtrl.__proto__ || Object.getPrototypeOf(CDAPQueryCtrl)).call(this, $scope, $injector));

    _this.uiSegmentSrv = uiSegmentSrv;

    // Initialize our fields, if any are missing. The target is passed to the
    // "query" method of the datasource object. In our case, these fields will
    // be lists of strings.
    _this.target.tags = _this.target.tags || [];
    _this.target.metrics = _this.target.metrics || [];
    _this.target.groups = _this.target.groups || [];

    // If the target already contains tags, metrics, or groups, then we'll need
    // to create some segments.
    var newSegment = function newSegment(value) {
      return uiSegmentSrv.newSegment({
        text: selectLabel,
        fake: false,
        value: value,
        expandable: false
      });
    };
    _this.tags = _lodash2.default.map(_this.target.tags, newSegment);
    _this.metrics = _lodash2.default.map(_this.target.metrics, newSegment);
    _this.groups = _lodash2.default.map(_this.target.groups, newSegment);
    return _this;
  }

  // The controller calls these methods when the user adds or removes something
  // to or from the query.


  _createClass(CDAPQueryCtrl, [{
    key: 'addTag',
    value: function addTag() {
      this._addNewSegment(this.tags);
    }
  }, {
    key: 'addMetric',
    value: function addMetric() {
      this._addNewSegment(this.metrics);
    }
  }, {
    key: 'addGroup',
    value: function addGroup() {
      this._addNewSegment(this.groups);
    }
  }, {
    key: 'removeTag',
    value: function removeTag() {
      this._removeSegment(this.tags);
    }
  }, {
    key: 'removeMetric',
    value: function removeMetric() {
      this._removeSegment(this.metrics);
    }
  }, {
    key: 'removeGroup',
    value: function removeGroup() {
      this._removeSegment(this.groups);
    }

    // You can add a tag if you don't have any, or if the last tag has a value.
    // (So like, if the last tag says "select", then we won't let you add another
    // tag. This probably isn't really necessary...)

  }, {
    key: 'canAddTag',
    value: function canAddTag() {
      return this.tags.length === 0 || _lodash2.default.last(this.tags).value !== selectLabel;
    }

    // Called when the user changes a tag. In this case, we throw out all the
    // subsequent tags, since tags are hierarchical. (So like, they changed some
    // place up in the hierarchy, and so we toss out everything below it and make
    // the user work from there. It would probably be nicer to keep the tags
    // around if they happen to make sense for the new context, though...)

  }, {
    key: 'tagChanged',
    value: function tagChanged(index) {
      this.tags.splice(index + 1);
      this.somethingChanged();
    }

    // Called when the user changes something. In this case, we read the current
    // tags, metrics, and groups, and call the refresh method on the superclass.

  }, {
    key: 'somethingChanged',
    value: function somethingChanged() {
      this.target.tags = this._readSegments(this.tags);
      this.target.metrics = this._readSegments(this.metrics);
      this.target.groups = this._readSegments(this.groups);
      this.refresh();
    }

    // Indicates which options should appear in a particular tag menu. The
    // available options depend on the previous tags, since tags are hierarchical.

  }, {
    key: 'getTagOptions',
    value: function getTagOptions(index) {
      var tags = this._readSegments(_lodash2.default.take(this.tags, index));
      return this.datasource.searchForTags(tags).then(this._createSegments());
    }

    // Indicates which metrics should appear in the menu. The available options
    // depend on the current tags.

  }, {
    key: 'getMetricOptions',
    value: function getMetricOptions() {
      var tags = this._readSegments(this.tags);
      return this.datasource.searchForMetrics(tags).then(this._createSegments());
    }

    // Indicates which groups should appear in the menu. As usual, the available
    // options depend on the current tags.

  }, {
    key: 'getGroupOptions',
    value: function getGroupOptions() {
      var tags = this._readSegments(this.tags);

      // In this case, we just care about the part of the name that appears
      // before the ":" character.
      return this.datasource.searchForTags(tags).then(function (strs) {
        return _lodash2.default.uniq(_lodash2.default.map(strs, function (x) {
          return x.split(':', 1)[0];
        }));
      }).then(this._createSegments());
    }

    // Utility method that reads the user's current selections.

  }, {
    key: '_readSegments',
    value: function _readSegments(array) {
      return _lodash2.default.filter(_lodash2.default.map(array, function (x) {
        return x.value;
      }), function (x) {
        return x !== selectLabel;
      });
    }

    // Utility method that creates a callback for a promise. It's used to take
    // reponse data from CDAP and create segments for the UI.

  }, {
    key: '_createSegments',
    value: function _createSegments() {
      var ui = this.uiSegmentSrv;
      return function (xs) {
        return _lodash2.default.map(xs, function (x) {
          return ui.newSegment({
            text: x,
            value: x,
            expandable: false
          });
        });
      };
    }

    // Utility method that creates a new segment in the UI.

  }, {
    key: '_addNewSegment',
    value: function _addNewSegment(array) {
      array.push(this.uiSegmentSrv.newSegment({ value: selectLabel, fake: true }));
    }

    // Utility method that removes a segment from the UI.

  }, {
    key: '_removeSegment',
    value: function _removeSegment(array) {
      if (array.length > 0) {
        array.splice(array.length - 1);
        this.somethingChanged();
      }
    }
  }]);

  return CDAPQueryCtrl;
}(_sdk.QueryCtrl);

CDAPQueryCtrl.templateUrl = 'public/plugins/cdap-grafana-datasource/partials/query.editor.html';
