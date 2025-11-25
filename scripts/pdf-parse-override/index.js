// SAFELY OVERRIDDEN VERSION OF pdf-parse/index.js
// Removes test block that tries to read missing PDFs.

const Pdf = require('./lib/pdf-parse.js');
module.exports = Pdf;

// No debug/test mode. No reading test PDFs. Nothing extra.
// This file fully replaces the broken upstream index.js.
