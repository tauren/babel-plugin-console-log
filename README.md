# Babel Plugin Console Log

A babel plugin for enhanced console logging behavior in browsers.

This plugin does not make any changes to the actual `console` object. It
simply provides convenience methods available in your development source
files. The transformed output simply effects the arguments that are 
passed to the `console` methods.

Thanks to the [meaningful logs plugin](https://github.com/furstenheim/babel-plugin-meaningful-logs) 
for inspiration!

## What problem does this plugin solve?

One of the primary disadvantages of using a client-side logging framework is that 
the original source file name and line number are not properly displayed in the 
console. This is because the logging frameworks create a *wrapper* around the 
actual `console.log` call, making appear that all logs originated from the same
location within the logging wrapper. This wrapper is typically necessary when any 
sort of dynamic processing is to take place. 

Some logging frameworks, such as [loglevel](http://pimterry.github.io/loglevel/), are 
able to retain the correct source file and line number by building logger functions 
that have been bound to the actual `console` commands. Unfortunately, there are 
significant limitations to this approach since it is still not possible to perform any 
dynamic changes at runtime. In fact, try using any *loglevel* plugin and you no longer
get accurate line number reporting.

Instead `babel-plugin-console-log` transforms calls to `console` methods at build time.
This enables developers to have a simple and clean logging API that gets converted to 
more complex `console` statements behind-the-scenes. When used in conjunction with a 
client-side logging framework such as *loglevel*, much more dynamic processing is 
possible without the drawbacks.

## What can you do with this plugin?

At this early stage of development, this plugin can be used to add **effects** to your 
console output. It can be used with both `console` logging as well as any logging
framework the user would like to use, such as `loglevel`, `winston`, `bunyan`, etc.

As it is further developed, far more capabilities are anticipated. See below for a 
list of future enhancements. These include prefixing logs with log level and module 
information, adding timestamps, labeling arguments, grouping arguments, and more.

## How does it work?

This babel plugin simply takes your development source and looks for AST nodes
that match any configured loggers (`console` by default). If the method called
on that logger matches a registered *effect*, then the output gets transformed
as specified by that effect.


# Installation

```
npm install --save-dev babel-plugin-console-log
```


# Configuration

## Loggers

By default, this plugin adds effects to the `console` logger. But it can be customized
to other loggers. For instance, to add effects to the winston logger instead of the console, 
you would put this in your `.babelrc` file:

```js
{
  "plugins": [
    [ "console-log", { "loggers": [{ "pattern": "winston" }] } ]
  ]
}
```

If you wanted effects to work on both `console` and a *loglevel* `log` instance: 

```js
{
  "plugins": [
    [ "console-log", { "loggers": [
      { "pattern": "console" },
      { "pattern": "log", "method": "trace" }
    ] } ]
  ]
}
```

The default *method* for loggers is `log`. In other words, when the plugin configuration
for an effect does not specify a method, `console.log` will be used (or `log.log`, etc.).
This can be overridden on a per-logger basis. For instance, **loglevel** does not have a
`log.log` method, so specifying `trace` will instead use `log.trace`. 

## Default Effects

This plugin adds convenience *effects* to the `console` object for use in your 
development source files. It does not actually change the real console object 
in any way. The following default effects are included:

* the colors defined in `lib/colors.js` 
* the background colors defined in `lib/colors.js` 
* the sizes defined in `lib/sizes.js` 
* additional built-in effects defined in `lib/effects.js`

Default effects can be used to colorize or change the font size of logged
output. For instance:

```js
console.green('I am green')
console.large('I am large')
console.bgsilver('I have a silver background')
console.highlight('I am highlight')
```

transforms to:

```js
console.log('%cI am green', 'color: green')
console.log('%cI am large', 'font-size: large')
console.log('%cI have a silver background', 'background-color: silver')
console.log('%cI am highlight', 'background-color: yellow; font-size: medium')
```

Note that at this time, only one *effect* may be used, you cannot chain multiple effects, 
but that is an enhancement that would be great to have. Feel free to contribute! 

Also, effects only work when the first argument is a string. If the first argument
is a number, a boolean, an expression, or anything else, the effect is not applied
to the log output. Hopefully we will soon also support templates as the first argument.

## Custom Effects

Users can create custom effects as well as override default effects. Standard 
`console` commands can also have effects applied to them. Custom effects can 
leverage multiple default effects or any styles you wish to include.

```js
{
  plugins: [
    [
      'console-log',
      { 
        effects: [
          { 
            pattern: 'bigblue',
            // Explicitly list styles
            styles: 'font-size: x-large; color: blue'
          },
          { 
            pattern: 'tinyred',
            // Use console.warn instead of console.log
            method: 'warn',
            // Combine styles from other effects
            effects: [ 'xxsmall', 'red' ]
          },
          { 
            // Add effect to built-in console method
            pattern: 'debug',
            // Combine styles from other effects
            effects: [ 'red', 'xlarge' ],
            // Add addtional styles
            styles: 'padding: 3px; font-weight: bold'
          } 
        ] 
      }
    ]
  ]
}
```

These could then be used like this:

```js
console.bigblue("Big and blue")
console.tinyred("Tiny and red and ouput using console.warn")
console.debug("Big and red and bold with padding")
```

See `test/main.js` for more examples.


# Possible Future Enhancements

The following are features that could be added to this plugin. If any of these interest you,
please contribute to the project!

## Combine multiple effects 

```js
console.yellow.bggrey.xlarge('I am extra large yellow text with grey background')
```

## Prefix templates

```js
import loglevel from 'loglevel'
const log = loglevel.getLogger('mymodule')
log.debug("Should add prefixed information")
```

Transforms to:

```js
import loglevel from 'loglevel'
const log = loglevel.getLogger('mymodule')
log.debug(`[${log.getLevel()}:${log.getName()}] Should add prefixed information`)
```

Note that Loglevel currently doesn't have a `getName()` method and would need to be improved. 

The [loglevel-message-prefix plugin](https://github.com/NatLibFi/loglevel-message-prefix)
may prove useful.

## Timestamp in templates

```js
console.log("Include a timestamp")
```

Transforms to:

```js
console.log(`[${(new Date()).toLocaleTime()}] Include a timestamp`)
```

## Argument labeling

```js
console.log(firstname, lastname, city)
console.log(a < 10, items[0])
```

Transforms to:

```js
console.log("firstname, lastname, city", firstname, lastname, city)
console.log("a < 10, items[0]", a < 10, items[0])
```

See [meaningful logs plugin](https://github.com/furstenheim/babel-plugin-meaningful-logs) for inspiration.

## Auto-grouping

```js
console.warn("User info collapsed", user, currentState, idx)

console.log.expanded("Project info expanded", project, currentState, idx)
```

Transforms to:

```js
console.groupCollapsed("%cUser info collapsed", "background-color: #FFFAE0; font-weight: normal; padding: 3px")
console.warn("user", user)
console.warn("currentState", currentState)
console.warn("idx", idx)
console.groupEnd()

console.group("Project info expanded")
console.log("project", project)
console.log("currentState", currentState)
console.log("idx", idx)
console.groupEnd()
```

## Logging Service Integration

```js
console.log('Print me and also sent me to remote service')
```

Tranforms to:

```js
console.log('Print me and also sent me to remote service')
remoteService.log('Print me and also sent me to remote service')
```


# Contributing

* Fork & clone locally
* Add tests
* Implement feature 
* Make sure all tests pass `npm run build; npm test`
* Create PR request (only ONE new feature per PR)


