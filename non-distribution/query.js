#!/usr/bin/env node

/*
Search the inverted index for a particular (set of) terms.
Usage: ./query.js your search terms
*/

const {execSync} = require('child_process');

function query(indexFile, args) {
  const rawInput = args.join(' ');

  let processed;
  try {
    processed = execSync(
        `echo "${rawInput}" | ./c/process.sh | ./c/stem.js`,
        {encoding: 'utf-8'},
    );
  } catch (err) {
    console.error('Error processing query:', err);
    return;
  }

  processed = processed.trim().replace(/\r?\n/g, ' ');

  if (!processed) {
    console.error('No search terms left after processing. No matches possible.');
    return;
  }

  try {
    // Use grep -F to treat the query as a fixed string (not a regex)
    const command = `grep -F "${processed}" "${indexFile}"`;
    const results = execSync(command, {encoding: 'utf-8'});

    // Print results without extra newlines
    console.log(results.trim());
  } catch (err) {
    if (err.status === 1) {
      // No matches found (grep exits with status 1 in this case)
      return;
    } else {
      console.error('Error running grep:', err);
    }
  }
}

const args = process.argv.slice(2); // Get command-line arguments
if (args.length < 1) {
  console.error('Usage: ./query.js [query_strings...]');
  process.exit(1);
}

const indexFile = 'd/global-index.txt'; // Path to the global index file
query(indexFile, args);
