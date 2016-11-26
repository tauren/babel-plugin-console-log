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
            if (firstArg.isStringLiteral()) {              
              path.node.arguments[0].value = '%c'+path.node.arguments[0].value
              path.node.arguments.splice(1, 0, t.stringLiteral(effect.styles))
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