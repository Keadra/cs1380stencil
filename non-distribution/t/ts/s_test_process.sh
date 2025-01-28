#!/bin/bash
# This is a student test
echo "Testing process.sh..."

INPUT="This is a TEST input."
EXPECTED_OUTPUT="test input"

OUTPUT=$(echo "$INPUT" | ./process.sh)

if [ "$OUTPUT" == "$EXPECTED_OUTPUT" ]; then
    echo "Test passed: process.sh"
else
    echo "Test failed: process.sh"
    echo "Expected: $EXPECTED_OUTPUT"
    echo "Got: $OUTPUT"
    exit 1
fi