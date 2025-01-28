#!/bin/bash
# This is a student test

echo "Testing merge.js..."

INPUT1='{"term1": ["page1"]}'
INPUT2='{"term1": ["page2"], "term2": ["page1"]}'
EXPECTED_OUTPUT='{"term1": ["page1", "page2"], "term2": ["page1"]}'

OUTPUT=$(echo -e "$INPUT1\n$INPUT2" | ./merge.js)

if [ "$OUTPUT" == "$EXPECTED_OUTPUT" ]; then
    echo "Test passed: merge.js"
else
    echo "Test failed: merge.js"
    echo "Expected: $EXPECTED_OUTPUT"
    echo "Got: $OUTPUT"
    exit 1
fi