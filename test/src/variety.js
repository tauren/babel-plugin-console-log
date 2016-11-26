// Define custom logger
var winston = require("winston");

function square(n) {
    // Logging inside scope
    console.blue("Blue Console");
    winston.red("Red Winston")
    return n * n;
}
n;

// Log methods without effects applied

console.debug("debug");
console.info("info");
winston.error("Error Winston");
winston.info("Info Winston");

// Log methods with effects applied

// String literals
console.highlight("Highlight");
console.log("Log");
winston.log("Winston log");
winston.highlight("Highlight Winston");

// Template literals
// console.log(`template ${ true }`);

// Non-string literals as first argument

console.log(2);
console.log(true);
console.log(/regex/);

// Non-literals as first argument
console.log({x: 1}, 2, 3, "foo");
console.highlight(square(5));
