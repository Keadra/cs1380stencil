#!/usr/bin/env node

/*
Convert each term to its stem
Usage: ./stem.js <input >output
*/

const readline = require('readline');
const natural = require('natural');

// Create a Porter Stemmer instance
const stemmer = natural.PorterStemmer;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', function(line) {
  // Split the line into individual terms
  const terms = line.split(/\s+/);

  // Stem each term and join them back into a single line
  const stemmedLine = terms.map((term) => stemmer.stem(term)).join(' ');

  // Print the stemmed line to the output
  console.log(stemmedLine.trim());
});
