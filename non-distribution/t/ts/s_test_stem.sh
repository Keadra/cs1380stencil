#!/bin/bash
# This is a student test

echo "Testing stem.js..."

INPUT="running jumps quickly"
EXPECTED_OUTPUT="run jump quick"

OUTPUT=$(echo "$INPUT" | ./stem.js)

if [ "$OUTPUT" == "$EXPECTED_OUTPUT" ]; then
    echo "Test passed: stem.js"
else
    echo "Test failed: stem.js"
    echo "Expected: $EXPECTED_OUTPUT"
    echo "Got: $OUTPUT"
    exit 1
fi