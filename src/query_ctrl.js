import _ from 'lodash';
import {QueryCtrl} from 'app/plugins/sdk';

// When the user adds a new tag, metric, or group, this is the label that we
// initially use. It means, "Hey, you need to pick something here."
var selectLabel = '[ select ]';


export class CDAPQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv, $q)  {
    super($scope, $injector);
    this.uiSegmentSrv = uiSegmentSrv;

    // Initialize our fields, if any are missing. The target is passed to the
    // "query" method of the datasource object. In our case, these fields will
    // be lists of strings.
    this.target.tags = this.target.tags || [];
    this.target.metrics = this.target.metrics || [];
    this.target.groups = this.target.groups || [];

    // If the target already contains tags, metrics, or groups, then we'll need
    // to create some segments.
    var newSegment = function(value) {
      return uiSegmentSrv.newSegment({
        text: selectLabel,
        fake: false,
        value: value,
        expandable: false
      });
    };
    this.tags = _.map(this.target.tags, newSegment);
    this.metrics = _.map(this.target.metrics, newSegment);
    this.groups = _.map(this.target.groups, newSegment);
  }

  // The controller calls these methods when the user adds or removes something
  // to or from the query.
  addTag() { this._addNewSegment(this.tags); }
  addMetric() { this._addNewSegment(this.metrics); }
  addGroup() { this._addNewSegment(this.groups); }
  removeTag() { this._removeSegment(this.tags); }
  removeMetric() { this._removeSegment(this.metrics); }
  removeGroup() { this._removeSegment(this.groups); }

  // You can add a tag if you don't have any, or if the last tag has a value.
  // (So like, if the last tag says "select", then we won't let you add another
  // tag. This probably isn't really necessary...)
  canAddTag() {
    return (this.tags.length === 0) || (_.last(this.tags).value !== selectLabel);
  }

  // Called when the user changes a tag. In this case, we throw out all the
  // subsequent tags, since tags are hierarchical. (So like, they changed some
  // place up in the hierarchy, and so we toss out everything below it and make
  // the user work from there. It would probably be nicer to keep the tags
  // around if they happen to make sense for the new context, though...)
  tagChanged(index) {
    this.tags.splice(index + 1);
    this.somethingChanged();
  }

  // Called when the user changes something. In this case, we read the current
  // tags, metrics, and groups, and call the refresh method on the superclass.
  somethingChanged() {
    this.target.tags = this._readSegments(this.tags);
    this.target.metrics = this._readSegments(this.metrics);
    this.target.groups = this._readSegments(this.groups);
    this.refresh();
  }

  // Indicates which options should appear in a particular tag menu. The
  // available options depend on the previous tags, since tags are hierarchical.
  getTagOptions(index) {
    let tags = this._readSegments(_.take(this.tags, index));
    return this.datasource.searchForTags(tags).then(this._createSegments());
  }

  // Indicates which metrics should appear in the menu. The available options
  // depend on the current tags.
  getMetricOptions() {
    let tags = this._readSegments(this.tags);
    return this.datasource.searchForMetrics(tags).then(this._createSegments());
  }

  // Indicates which groups should appear in the menu. As usual, the available
  // options depend on the current tags.
  getGroupOptions() {
    let tags = this._readSegments(this.tags);

    // In this case, we just care about the part of the name that appears
    // before the ":" character.
    return this.datasource.searchForTags(tags)
      .then(strs => _.uniq(_.map(strs, x => x.split(':', 1)[0])))
      .then(this._createSegments());
  }

  // Utility method that reads the user's current selections.
  _readSegments(array) {
    return _.filter(_.map(array, x => x.value), x => x !== selectLabel);
  }

  // Utility method that creates a callback for a promise. It's used to take
  // reponse data from CDAP and create segments for the UI.
  _createSegments() {
    let ui = this.uiSegmentSrv;
    return xs => _.map(xs, x => ui.newSegment({
      text: x,
      value: x,
      expandable: false
    }));
  }

  // Utility method that creates a new segment in the UI.
  _addNewSegment(array) {
    array.push(this.uiSegmentSrv.newSegment({value: selectLabel, fake: true}));
  }

  // Utility method that removes a segment from the UI.
  _removeSegment(array) {
    if (array.length > 0) {
      array.splice(array.length - 1);
      this.somethingChanged();
    }
  }
}

CDAPQueryCtrl.templateUrl = 'public/plugins/cdap-grafana-datasource/partials/query.editor.html';
