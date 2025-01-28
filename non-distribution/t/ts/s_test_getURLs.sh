#!/bin/bash
# This is a student test

echo "Testing getURLs.js..."

INPUT='<html><body><a href="https://example.com">Link</a></body></html>'
EXPECTED_OUTPUT="https://example.com"

OUTPUT=$(echo "$INPUT" | ./getURLs.js)

if [ "$OUTPUT" == "$EXPECTED_OUTPUT" ]; then
    echo "Test passed: getURLs.js"
else
    echo "Test failed: getURLs.js"
    echo "Expected: $EXPECTED_OUTPUT"
    echo "Got: $OUTPUT"
    exit 1
fi