'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _colors = require('./colors');

var _colors2 = _interopRequireDefault(_colors);

var _sizes = require('./sizes');

var _sizes2 = _interopRequireDefault(_sizes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var effects = [];

// Register size effects
effects = effects.concat(_sizes2.default.map(function (size) {
  return {
    pattern: size.replace(/-/g, ''),
    styles: 'font-size: ' + size
  };
}));

// Register color effects
effects = effects.concat(_colors2.default.map(function (color) {
  return {
    pattern: color,
    styles: 'color: ' + color
  };
}));

// Register background color effects
effects = effects.concat(_colors2.default.map(function (color) {
  return {
    pattern: 'bg' + color,
    styles: 'background-color: ' + color
  };
}));

// Register named effects
effects.push({
  pattern: 'highlight',
  effects: ['bgyellow', 'medium']
});

// Effects for future log grouping feature
effects.push({
  pattern: 'debugEffect',
  styles: 'color: blue; font-weight: normal'
});
effects.push({
  pattern: 'infoEffect',
  styles: 'font-weight: normal'
});
effects.push({
  pattern: 'traceEffect',
  styles: 'font-weight: normal'
});
effects.push({
  pattern: 'warnEffect',
  styles: 'background-color: #FFFAE0; font-weight: normal; padding: 3px'
});
effects.push({
  pattern: 'errorEffect',
  styles: 'color: red; font-weight: normal; background-color: #FEECEC; padding: 3px'
});

exports.default = effects;