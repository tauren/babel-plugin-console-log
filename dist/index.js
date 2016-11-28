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
            var template = void 0;
            if (firstArg.isStringLiteral() || firstArg.isTemplateLiteral()) {
              template = effect.template || '__input__';
            } else {
              template = effect.template || '';
            }
            // template = template.replace(/__timestamp__/gi, )
            if (template.indexOf('__input__') === -1) {
              path.node.arguments.splice(0, 0, t.stringLiteral(template));
            }
            if (typeof effect.styles === 'string') {
              template = '%c' + template;
              path.node.arguments.splice(1, 0, t.stringLiteral(effect.styles));
            }
            var parts = template.split('__input__').map(function (item) {
              return t.stringLiteral(item);
            });
            for (var i = parts.length - 1; i > 0; i--) {
              parts.splice(i, 0, firstArg.node);
            }
            var expression = parts[0];
            if (_lodash2.default.every(parts, function (p) {
              return t.isStringLiteral(p);
            })) {
              // All parts are strings, so just join them into a single string
              expression = t.stringLiteral(_lodash2.default.map(parts, function (p) {
                return p.value;
              }).join(''));
            } else {
              // Parts are not all strings, so build an expression
              for (var _i = 1; _i < parts.length; _i++) {
                if (t.isStringLiteral(parts[_i]) && parts[_i].value === '') {
                  // This part is an empty string, so skip it
                  break;
                }
                expression = t.binaryExpression('+', expression, parts[_i]);
              }
            }
            path.node.arguments[0] = expression;
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