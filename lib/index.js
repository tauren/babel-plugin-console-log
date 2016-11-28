import _ from 'lodash'
import defaultEffects from './effects'
import defaultLoggers from './loggers'

export default function ({ types: t}) {
  return {
    visitor: {
      CallExpression(path, options) {
        // Use default loggers if user did not specify loggers
        const loggers = options.opts.loggers || defaultLoggers
        const logger = getLogger(path, loggers);
        if (logger) {
          // This concats user-supplied effects in front of default effects so that
          // the user effects are found first, effectively overriding defaults
          // TODO: Possibly remove default effects that are overridden
          const effects = (options.opts.effects || []).concat(defaultEffects)
          // TOOD: Or perhaps use a hash instead of an array
          // var effects = _.assign({}, defaultEffects, options.opts.effects)
          const effect = getEffect(path, effects, logger)
          if (effect) {
            path.node.callee.property.name = effect.method || logger.method || 'log'
            const firstArg = path.get('arguments')[0]
            let template
            if (firstArg.isStringLiteral() || firstArg.isTemplateLiteral()) {
              template = effect.template || '__input__'
            }
            else {
              template = effect.template || ''              
            }
            // TODO: Add support for timestamps
            // template = template.replace(/__timestamp__/gi, '')
            if (template.indexOf('__input__') === -1) {
              path.node.arguments.splice(0, 0, t.stringLiteral(template))
            }
            if (typeof effect.styles === 'string') {
              template = '%c' + template
              path.node.arguments.splice(1, 0, t.stringLiteral(effect.styles))
            }
            let parts = template.split('__input__').map(item => t.stringLiteral(item))
            for (let i = parts.length - 1; i > 0; i--) {
              parts.splice(i, 0, firstArg.node)
            }
            let expression = parts[0]
            if (_.every(parts, p => t.isStringLiteral(p))) {
              // All parts are strings, so just join them into a single string
              expression = t.stringLiteral(_.map(parts, p => p.value).join(''))
            }
            else {
              // Parts are not all strings, so build an expression
              for (let i = 1; i < parts.length; i++) {
                if (t.isStringLiteral(parts[i]) && parts[i].value === '') {
                  // This part is an empty string, so skip it
                  break;
                }
                expression = t.binaryExpression('+', expression, parts[i])
              }
            }
            path.node.arguments[0] = expression
          }
        }
      }
    }
  }
}

const getLogger = (path, loggers) => _.find(
  loggers, 
  logger => path.get("callee").matchesPattern(logger.pattern, true)
)

const getEffect = (path, effects, logger) => extendEffect(_.find(
  effects, 
  effect => path.get("callee").matchesPattern(`${logger.pattern}.${effect.pattern}`)
), effects)

const extendEffect = (effect, effects) => {
  if(!effect || !effect.effects || !effect.effects.length) {
    return effect
  }
  let styles = _.map(effect.effects, effectName => (_.find(
    effects, 
    { pattern: effectName }
  ) || {}).styles)
  styles.push(effect.styles)
  return _.assign({}, effect, { styles: _.compact(styles).join(';') })
}