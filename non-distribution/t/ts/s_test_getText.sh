#!/bin/bash
# This is a student test

echo "Testing getText.js..."

INPUT="<html><body><p>Hello, world!</p></body></html>"
EXPECTED_OUTPUT="Hello, world!"

OUTPUT=$(echo "$INPUT" | ./getText.js)

if [ "$OUTPUT" == "$EXPECTED_OUTPUT" ]; then
    echo "Test passed: getText.js"
else
    echo "Test failed: getText.js"
    echo "Expected: $EXPECTED_OUTPUT"
    echo "Got: $OUTPUT"
    exit 1
fi