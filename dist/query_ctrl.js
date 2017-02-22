'use strict';

System.register(['lodash', 'app/plugins/sdk'], function (_export, _context) {
  "use strict";

  var _, QueryCtrl, _createClass, selectLabel, CDAPQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
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

      selectLabel = '[ select ]';

      _export('CDAPQueryCtrl', CDAPQueryCtrl = function (_QueryCtrl) {
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
          _this.tags = _.map(_this.target.tags, newSegment);
          _this.metrics = _.map(_this.target.metrics, newSegment);
          _this.groups = _.map(_this.target.groups, newSegment);
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
        }, {
          key: 'canAddTag',
          value: function canAddTag() {
            return this.tags.length === 0 || _.last(this.tags).value !== selectLabel;
          }
        }, {
          key: 'tagChanged',
          value: function tagChanged(index) {
            this.tags.splice(index + 1);
            this.somethingChanged();
          }
        }, {
          key: 'somethingChanged',
          value: function somethingChanged() {
            this.target.tags = this._readSegments(this.tags);
            this.target.metrics = this._readSegments(this.metrics);
            this.target.groups = this._readSegments(this.groups);
            this.refresh();
          }
        }, {
          key: 'getTagOptions',
          value: function getTagOptions(index) {
            var tags = this._readSegments(_.take(this.tags, index));
            return this.datasource.searchForTags(tags).then(this._createSegments());
          }
        }, {
          key: 'getMetricOptions',
          value: function getMetricOptions() {
            var tags = this._readSegments(this.tags);
            return this.datasource.searchForMetrics(tags).then(this._createSegments());
          }
        }, {
          key: 'getGroupOptions',
          value: function getGroupOptions() {
            var tags = this._readSegments(this.tags);

            // In this case, we just care about the part of the name that appears
            // before the ":" character.
            return this.datasource.searchForTags(tags).then(function (strs) {
              return _.uniq(_.map(strs, function (x) {
                return x.split(':', 1)[0];
              }));
            }).then(this._createSegments());
          }
        }, {
          key: '_readSegments',
          value: function _readSegments(array) {
            return _.filter(_.map(array, function (x) {
              return x.value;
            }), function (x) {
              return x !== selectLabel;
            });
          }
        }, {
          key: '_createSegments',
          value: function _createSegments() {
            var ui = this.uiSegmentSrv;
            return function (xs) {
              return _.map(xs, function (x) {
                return ui.newSegment({
                  text: x,
                  value: x,
                  expandable: false
                });
              });
            };
          }
        }, {
          key: '_addNewSegment',
          value: function _addNewSegment(array) {
            array.push(this.uiSegmentSrv.newSegment({ value: selectLabel, fake: true }));
          }
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
      }(QueryCtrl));

      _export('CDAPQueryCtrl', CDAPQueryCtrl);

      CDAPQueryCtrl.templateUrl = 'public/plugins/cdap-grafana-datasource/partials/query.editor.html';
    }
  };
});
