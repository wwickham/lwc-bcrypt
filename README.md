# lwc-bcrypt
An implementation of Bcrypt in a LWC, for use in Salesforce flows and automations. Utilizes the JavaScript library [bcrypt.js](https://github.com/dcodeIO/bcrypt.js).

# Security considerations
Besides incorporating a salt to protect against rainbow table attacks, bcrypt is an adaptive function: over time, the iteration count can be increased to make it slower, so it remains resistant to brute-force search attacks even with increasing computation power. [(see)](https://en.wikipedia.org/wiki/Bcrypt)

While bcrypt.js is compatible to the C++ bcrypt binding, it is written in pure JavaScript and thus slower [(about 30%)](https://github.com/dcodeIO/bcrypt.js/wiki/Benchmark), effectively reducing the number of iterations that can be processed in an equal time span.

The maximum input length is 72 bytes (note that UTF-8 encoded characters use up to 4 bytes) and the length of generated hashes is 60 characters. Note that maximum input length is not implicitly checked by the library for compatibility with the C++ binding on Node.js, but should be checked with `bcrypt.truncates(password)` where necessary.

# Bcrypt in JavaScript
This project includes a modified version of the bcrypt.js pro to ensure compatibility with Salesforce Lightning Web Components (LWC). While the upstream library works in standard ES module environments, LWC does not support arbitrary import/export usage within a component bundle. As a result, the library was adjusted by removing ES module export statements (converting exported functions to standard function declarations) and eliminating an unsupported top-level import. These changes allow the code to execute correctly within the LWC runtime without altering the underlying logic of the library.
