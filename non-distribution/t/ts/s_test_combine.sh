#!/bin/bash
# This is a student test

echo "Testing combine.sh edge cases..."

INPUT=""
EXPECTED_OUTPUT=""
OUTPUT=$(echo "$INPUT" | ./combine.sh)
if [ "$OUTPUT" == "$EXPECTED_OUTPUT" ]; then
    echo "  Test 1 passed"
else
    echo "  Test 1 failed"
    echo "  Expected: '$EXPECTED_OUTPUT'"
    echo "  Got: '$OUTPUT'"
    exit 1
fi