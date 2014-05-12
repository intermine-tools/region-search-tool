define(['react', 'q', 'lodash/arrays/zipObject', './mixins', './region'], function (React, Q, zipObject, mixins, Region) {
  'use strict';

  var d = React.DOM;

  var Main = React.createClass({

    displayName: 'Main',

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    getInitialState: function () {
      return {
        activeTypes: zipObject(this.props.types.map(function (_, i) { return [i, true]; })),
        typeNames: this.props.types,
        exportFormat: 'fasta'
      };
    },

    render: function () {
      var title = this._getTitle();
      var activeTypes = this.state.activeTypes;
      var props = this.props;
      var types = props.types.filter(function (t, i) { return activeTypes[i]; });
      console.log(types, activeTypes);
      return d.div(
        null,
        d.div(
          {className: 'page-header'},
          d.h1(
            null,
            title,
            d.small(null, " found in ", props.organism))),
        this.renderToolBar(),
        d.ul(
          {className: 'list-group'},
          this.props.regions.map(function (region, i) {
            return Region({
              key: i,
              className: 'list-group-item',
              region: region,
              service: props.service,
              types: types, 
              organism: props.organism
            });
          })));
    },

    renderToolBar: function () {
      var props = this.props;
      var that = this;
      var state = this.state;
      return d.div(
          {className: 'btn-toolbar'},
          this.renderTypeControls(),
          d.div(
            {className: 'btn-group'},
            d.button(
              {className: 'btn btn-default'},
              "Select all")),
          d.div(
            {className: 'btn-group'},
            d.button(
              {className: 'btn btn-default'},
              'Download as ', state.exportFormat),
            d.button(
              {className: 'btn btn-default dropdown-toggle', 'data-toggle': 'dropdown'},
              d.span({className: 'caret'}),
              d.span({className: 'sr-only'}, "toggle dropdown")),
            d.ul(
              {className: 'dropdown-menu'},
              ['fasta', 'gff3', 'json', 'xml'].map(function (fmt) {
                return d.li(
                  {
                    key: fmt,
                onClick: that.setStateProperty.bind(that, 'exportFormat', fmt), 
                className: state.exportFormat === fmt ? 'active' : ''
                  }, d.a(null, fmt));
              }))));
    },

    computeState: function () {
      var that = this;
      this.props.service.fetchModel().then(function (model) {
        var promises = that.props.types.map(function (type) {
          return model.makePath(type).getDisplayName();
        });
        Q.all(promises).then(that.setStateProperty.bind(null, 'typeNames'));
      });
    },

    renderTypeControls: function () {
      var that = this;
      var activeTypes = this.state.activeTypes;
      var names = this.state.typeNames;
      if (names.length < 5) {
        return d.div(
            {className: 'btn-group'},
            names.map(function (name, i) {
              return d.button(
                {
                  key: i,
                  onClick: that.toggleType.bind(that, i),
                  className: 'btn btn-default' + (activeTypes[i] ? ' active' : '')
                }, name);
            }));
      } else {
        return d.div(
            {className: 'btn-group'},
            d.button(
              {className: 'btn btn-default dropdown-toggle', 'data-toggle': 'dropdown'},
              names.length,
              ' types',
              d.span({className: 'caret'})),
            d.ul(
              {className: 'dropdown-menu'},
              names.map(function (name, i) {
                return d.li(
                  {
                    key: i,
                    onClick: that.toggleType.bind(that, i), 
                    className: activeTypes[i] ? 'active' : ''
                  }, d.a(null, name));
              })));
      }
    },

    toggleType: function (index) {
      var activeTypes = this.state.activeTypes;
      activeTypes[index] = !activeTypes[index];
      this.setStateProperty('activeTypes', activeTypes);
    },

    _getTitle: function () {
      var names = this.state.typeNames.map(function (n) { return n + 's'; });
      if (names.length >= 3) {
        var last = names.pop();
        return names.join(', ') + ' and ' + last;
      } else {
        return names.join(' and ');
      }
    }
  });

  return Main;
});
