#!/bin/bash
# This is a student test

# Test 1: Empty input
echo "Test 1: Empty input"
INPUT=""
URL="http://example.com"
EXPECTED_OUTPUT=""
OUTPUT=$(echo "$INPUT" | ./invert.sh "$URL")
if [ "$OUTPUT" == "$EXPECTED_OUTPUT" ]; then
    echo "  Test 1 passed"
else
    echo "  Test 1 failed"
    echo "  Expected: '$EXPECTED_OUTPUT'"
    echo "  Got: '$OUTPUT'"
    exit 1
fi
