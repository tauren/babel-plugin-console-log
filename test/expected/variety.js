// Define custom logger
var winston = require("winston");

function square(n) {
    // Logging inside scope
    console.log("%cBlue Console", "color: blue");
    winston.log("%cRed Winston", "color: red");
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
console.info("%cHighlight", "font-size: large; color: green");
console.log("%cLog", "font-size: small; color: blue");
winston.log("%cWinston log", "font-size: small; color: blue");
winston.info("%cHighlight Winston", "font-size: large; color: green");

// Template literals
// console.log(`template ${ true }`);

// Non-string literals as first argument

console.log("%c", "font-size: small; color: blue", 2);
console.log("%c", "font-size: small; color: blue", true);
console.log("%c", "font-size: small; color: blue", /regex/);

// Non-literals as first argument
console.log("%c", "font-size: small; color: blue", { x: 1 }, 2, 3, "foo");
console.info("%c", "font-size: large; color: green", square(5));