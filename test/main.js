"use strict"
var babel = require('babel-core')
var transform = babel.transform
var transformFileSync = babel.transformFileSync
var path = require('path')
var fs = require('fs')
var assert = require('assert')

var plugin = require('../dist/index').default

describe('babel-plugin-console', function() {
  var tests = [{
    description: 'does not transforom console.log',
    source: 'console.log("foo");',
    expected: 'console.log("foo");'
  }, {
    description: 'does not transforom console.debug',
    source: 'console.debug("foo");',
    expected: 'console.debug("foo");'
  }, {
    description: 'does not transforom console.warn',
    source: 'console.warn("foo");',
    expected: 'console.warn("foo");'
  }, {
    description: 'does not transforom console.error',
    source: 'console.error("foo");',
    expected: 'console.error("foo");'
  }, {
    description: 'transfoms a console effect',
    source: 'console.blue("foo");',
    expected: 'console.log("%cfoo", "color: blue");'
  }, {
    description: 'transfoms a console effect in nested scope',
    source: 'function foo() { console.blue("foo"); }',
    expected: 'function foo() {\n  console.log("%cfoo", "color: blue");\n}'
  }, {
    description: 'transforms overriden logger',
    options: {
      loggers: [{
        pattern: 'winston'
      }]
    },
    source: 'winston.blue("foo");',
    expected: 'winston.log("%cfoo", "color: blue");'
  }, {
    description: 'does not transform console effects when loggers overriden',
    options: {
      loggers: [{
        pattern: 'winston'
      }]
    },
    source: 'console.blue("foo");',
    expected: 'console.blue("foo");'
  }, {
    description: 'transforms overridden loggers with multiple loggers',
    options: {
      loggers: [{
        pattern: 'console'
      }, {
        pattern: 'winston'
      }]
    },
    source: 'console.blue("foo");\nwinston.red("bar")',
    expected: 'console.log("%cfoo", "color: blue");\nwinston.log("%cbar", "color: red");'
  }, {
    description: 'transforms custom effect',
    options: {
      effects: [{
        pattern: 'big',
        styles: 'font-size: x-large'
      }]
    },
    source: 'console.big("foo");',
    expected: 'console.log("%cfoo", "font-size: x-large");'
  }, {
    description: 'transforms overridden default effect',
    options: {
      effects: [{
        pattern: 'blue',
        styles: 'color: red'
      }]
    },
    source: 'console.blue("foo");',
    expected: 'console.log("%cfoo", "color: red");'
  }, {
    description: 'transforms overridden console method',
    options: {
      effects: [{
        pattern: 'log',
        styles: 'color: silver'
      }]
    },
    source: 'console.log("foo");',
    expected: 'console.log("%cfoo", "color: silver");'
  }, {
    description: 'transforms with specified method',
    options: {
      effects: [{
        pattern: 'warning',
        method: 'warn',
        styles: 'color: orange'
      }]
    },
    source: 'console.warning("foo");',
    expected: 'console.warn("%cfoo", "color: orange");'
  }, {
    description: 'uses default method for a specific logger',
    options: {
      loggers: [{
        pattern: 'log',
        method: 'trace'
      }]
    },
    source: 'log.blue("foo");',
    expected: 'log.trace("%cfoo", "color: blue");'
  }, {
    description: 'transforms when styles is empty string',
    options: {
      effects: [{
        pattern: 'log',
        styles: ''
      }]
    },
    source: 'console.log("foo");',
    expected: 'console.log("%cfoo", "");'
  }, {
    description: 'transforms only method when styles is not a string',
    options: {
      effects: [{
        pattern: 'blue',
        styles: false
      }]
    },
    source: 'console.blue("foo");',
    expected: 'console.log("foo");'
  }, {
    description: 'transforms only method when styles is not defined',
    options: {
      effects: [{
        pattern: 'blue'
      }]
    },
    source: 'console.blue("foo");',
    expected: 'console.log("foo");'
  }, {
    description: 'transforms default effect when custom effects exist',
    options: {
      effects: [{
        pattern: 'highlight',
        styles: 'font-size: large; color: green'
      }]
    },
    source: 'console.blue("foo");',
    expected: 'console.log("%cfoo", "color: blue");'
  }, {
    description: 'transforms when first argument is string',
    source: 'console.blue("foo");',
    expected: 'console.log("%cfoo", "color: blue");'
  }, {
    description: 'transforms when first argument is template',
    source: 'console.blue(`foo`);',
    expected: 'console.log("%c" + `foo`, "color: blue");'
  }, {
    description: 'transform only method when first argument is number',
    source: 'console.blue(2);',
    expected: 'console.log(2);'
  }, {
    description: 'transform only method when first argument is regex',
    source: 'console.blue(/foo/);',
    expected: 'console.log(/foo/);'
  }, {
    description: 'transform only method when first argument is null',
    source: 'console.blue(null);',
    expected: 'console.log(null);'
  }, {
    description: 'transform only method when first argument is boolean',
    source: 'console.blue(true);',
    expected: 'console.log(true);'
  }, {
    description: 'transforms effect that extends other effects',
    options: {
      effects: [{
        pattern: 'notice',
        effects: ['red', 'xlarge'],
        styles: 'background-color: black'
      }]
    },
    source: 'console.notice("foo");',
    expected: 'console.log("%cfoo", "color: red;font-size: x-large;background-color: black");'
  // }, {
  //   description: 'transforms with a custom template',
  //   options: {
  //     effects: [{
  //       pattern: 'big',
  //       template: '[DEBUG] ${__input__}',
  //       styles: 'font-size: x-large'
  //     }]
  //   },
  //   source: 'console.big("foo");',
  //   expected: 'console.log("%c[DEBUG] foo", "font-size: x-large");'
  // }, {
  //   description: 'transforms with a custom template including timestamp',
  //   options: {
  //     effects: [{
  //       pattern: 'big',
  //       template: '${__timestamp__}: ${__input__}',
  //       styles: 'font-size: x-large'
  //     }]
  //   },
  //   source: 'console.log("foo");',
  //   expected: 'console.log(`%c${(new Date()).toLocaleTimeString()}: ${__input__}`, "font-size: x-large");'
  }]

  tests.forEach(function (test) {
    it(test.description, function (done) {
      var transformed = transform(test.source, {
        plugins: [[plugin, test.options]],
        babelrc: false // So we don't get babelrc from whole project
      }).code
      assert.equal(transformed, test.expected)
      done()
    })
  })

})

var fileTests = [{
  file: 'variety',
  options: {
    loggers: [{
      pattern: 'console'
    }, {
      pattern: 'winston'
    }],
    effects: [{
      pattern: 'highlight',
      method: 'info',
      styles: 'font-size: large; color: green'
    }, {
      pattern: 'log',
      styles: 'font-size: small; color: blue'
    }, {
      pattern: 'largeBlue',
      // Merge styles from other effects
      // Ignores prefix and method from other effects
      effects: ['large', 'blue']
    }]
  }
}]

describe('transforms relative file paths', function () {
  fileTests.forEach(function (test) {
      it(`No preset ${test.file}`, function (done) {
        var transform = transformFileSync(`test/src/${test.file}.js`, {
          plugins: [[plugin, test.options]],
          babelrc: false // So we don't get babelrc from whole project
        }).code
        var expected = fs.readFileSync(path.join(__dirname, `expected/${test.file}.js`)).toString()
        assert.equal(transform, expected)
        done()
      })
  })
})
describe('transforms absolute file paths', function () {
    fileTests.forEach(function(test){
        it(`Absolute path ${test.file}`, function(done) {
            var transform = transformFileSync(path.join(__dirname, `src/${test.file}.js`), {
                plugins: [[plugin, test.options]],
                babelrc: false // So we don't get babelrc from whole project
            }).code
            var expected = fs.readFileSync(path.join(__dirname, `expected/${test.file}.js`)).toString()
            assert.equal(transform, expected)
            done()
        })
    })
})
