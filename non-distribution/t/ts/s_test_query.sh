#!/bin/bash
# This is a student test
echo "Testing query.js..."

QUERY="example"
INDEX='{"example": ["page1", "page2"]}'
EXPECTED_OUTPUT="page1 page2"

OUTPUT=$(echo "$INDEX" | ./query.js "$QUERY")

if [ "$OUTPUT" == "$EXPECTED_OUTPUT" ]; then
    echo "Test passed: query.js"
else
    echo "Test failed: query.js"
    echo "Expected: $EXPECTED_OUTPUT"
    echo "Got: $OUTPUT"
    exit 1
fi