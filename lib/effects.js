import colors from './colors'
import sizes from './sizes'

let effects = []

// Register size effects
effects = effects.concat(sizes.map(size => ({
  pattern: size.replace(/-/g, ''),
  styles: `font-size: ${size}`
})))

// Register color effects
effects = effects.concat(colors.map(color => ({
  pattern: color,
  styles: `color: ${color}`
})))

// Register background color effects
effects = effects.concat(colors.map(color => ({
  pattern: 'bg'+color,
  styles: `background-color: ${color}`
})))

// Register named effects
effects.push({
  pattern: 'highlight',
  effects: ['bgyellow', 'medium']
})

// Effects for future log grouping feature
effects.push({
  pattern: 'debugEffect',
  styles: 'color: blue; font-weight: normal'
})
effects.push({
  pattern: 'infoEffect',
  styles: 'font-weight: normal'
})
effects.push({
  pattern: 'traceEffect',
  styles: 'font-weight: normal'
})
effects.push({
  pattern: 'warnEffect',
  styles: 'background-color: #FFFAE0; font-weight: normal; padding: 3px'
})
effects.push({
  pattern: 'errorEffect',
  styles: 'color: red; font-weight: normal; background-color: #FEECEC; padding: 3px'
})

export default effects
