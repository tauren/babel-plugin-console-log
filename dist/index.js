'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      CallExpression: function CallExpression(path, options) {
        // Use default loggers if user did not specify loggers
        var loggers = options.opts.loggers || _loggers2.default;
        var logger = getLogger(path, loggers);
        if (logger) {
          // This concats user-supplied effects in front of default effects so that
          // the user effects are found first, effectively overriding defaults
          // TODO: Possibly remove default effects that are overridden
          var effects = (options.opts.effects || []).concat(_effects2.default);
          // TOOD: Or perhaps use a hash instead of an array
          // var effects = _.assign({}, defaultEffects, options.opts.effects)
          var effect = getEffect(path, effects, logger);
          if (effect) {
            path.node.callee.property.name = effect.method || logger.method || 'log';
            var firstArg = path.get('arguments')[0];
            if (firstArg.isStringLiteral()) {
              path.node.arguments[0].value = '%c' + path.node.arguments[0].value;
              path.node.arguments.splice(1, 0, t.stringLiteral(effect.styles));
            }
            // TODO: Figure out how to build a template literal
            // if (firstArg.isTemplateLiteral()) {        
            //   path.node.arguments[0] = t.templateLiteral([
            //   //   t.templateElement('%c'),
            //   //   t.templateElement(firstArg.value)
            //   // ], [])
            //   path.node.arguments[0].quasis.unshift(
            //     t.templateElement(t.stringLiteral('%c'))
            //   )
            //   path.node.arguments.splice(1, 0, t.stringLiteral(effect.styles))
            // }
          }
        }
      }
    }
  };
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _effects = require('./effects');

var _effects2 = _interopRequireDefault(_effects);

var _loggers = require('./loggers');

var _loggers2 = _interopRequireDefault(_loggers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLogger = function getLogger(path, loggers) {
  return _lodash2.default.find(loggers, function (logger) {
    return path.get("callee").matchesPattern(logger.pattern, true);
  });
};

var getEffect = function getEffect(path, effects, logger) {
  return extendEffect(_lodash2.default.find(effects, function (effect) {
    return path.get("callee").matchesPattern(logger.pattern + '.' + effect.pattern);
  }), effects);
};

var extendEffect = function extendEffect(effect, effects) {
  if (!effect || !effect.effects || !effect.effects.length) {
    return effect;
  }
  var styles = _lodash2.default.map(effect.effects, function (effectName) {
    return (_lodash2.default.find(effects, { pattern: effectName }) || {}).styles;
  });
  styles.push(effect.styles);
  return _lodash2.default.assign({}, effect, { styles: _lodash2.default.compact(styles).join(';') });
};