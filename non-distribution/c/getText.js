#!/usr/bin/env node

/*
Extract all text from an HTML page.
Usage: ./getText.js <input > output
*/

const {convert} = require('html-to-text');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
});

// Declare html first
let html = '';

rl.on('line', (line) => {
  // Accumulate the HTML
  html += line + '\n';
});

// After all input is received, use convert to output plain text
rl.on('close', () => {
  const text = convert(html, {wordwrap: false});
  console.log(text);
});

