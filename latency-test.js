const { serialize, deserialize } = require("./distribution/util/serialization.js");
const { performance } = require("perf_hooks");
const assert = require("assert");

// ---------------------------
// Define workloads (including function objects)
// ---------------------------
const workloads = {
  // Basic types: number, string, boolean, null, undefined
  basic: { a: 42, b: "hello", c: true, d: null, e: undefined },

  // Complex object: includes Date, Error, array, and nested object
  complex: {
    number: 42,
    string: "hello",
    boolean: true,
    date: new Date(),
    error: new Error("Test error"),
    array: [1, 2, 3],
    nestedObject: { a: 1, b: 2 },
  },

  // Recursive structure (for this example, a simple self-contained object)
  recursive: (() => {
    const obj = { a: 1 };
    return obj;
  })(),

  // Function workload: includes function objects at different levels
  functionWorkload: {
    // A standard function
    simpleFunction: function () {
      return "hello world";
    },
    // An arrow function
    arrowFunction: () => 42,
    // A nested function inside an object
    nested: {
      multiply: function (a, b) {
        return a * b;
      },
    },
  },
};

// ---------------------------
// Latency Test Functions
// ---------------------------
function measureLatency(workload, iterations = 100) {
  const serializeTimes = [];
  const deserializeTimes = [];

  for (let i = 0; i < iterations; i++) {
    // Measure serialization time
    const startSerialize = performance.now();
    const serialized = serialize(workload);
    const endSerialize = performance.now();
    serializeTimes.push(endSerialize - startSerialize);

    // Measure deserialization time
    const startDeserialize = performance.now();
    deserialize(serialized);
    const endDeserialize = performance.now();
    deserializeTimes.push(endDeserialize - startDeserialize);
  }

  // Calculate average latencies
  const avgSerializeLatency =
    serializeTimes.reduce((sum, time) => sum + time, 0) / iterations;
  const avgDeserializeLatency =
    deserializeTimes.reduce((sum, time) => sum + time, 0) / iterations;

  return { avgSerializeLatency, avgDeserializeLatency };
}

function runLatencyTests() {
  const results = {};

  for (const [name, workload] of Object.entries(workloads)) {
    results[name] = measureLatency(workload);
  }

  console.log("=== Latency Results ===");
  for (const [name, { avgSerializeLatency, avgDeserializeLatency }] of Object.entries(results)) {
    console.log(`Workload: ${name}`);
    console.log(`  Average Serialize Latency: ${avgSerializeLatency.toFixed(4)} ms`);
    console.log(`  Average Deserialize Latency: ${avgDeserializeLatency.toFixed(4)} ms`);
  }
}

// ---------------------------
// Correctness (Round-Trip) Tests
// ---------------------------

/**
 * Test that the basic workload survives a serialize/deserialize round-trip.
 */
function testBasicRoundTrip() {
  const workload = workloads.basic;
  const serialized = serialize(workload);
  const deserialized = deserialize(serialized);

  // Check each property.
  assert.strictEqual(deserialized.a, 42);
  assert.strictEqual(deserialized.b, "hello");
  assert.strictEqual(deserialized.c, true);
  assert.strictEqual(deserialized.d, null);
  // Depending on your implementation, undefined properties might be omitted.
  if (Object.prototype.hasOwnProperty.call(deserialized, "e")) {
    assert.strictEqual(deserialized.e, undefined);
  }
}

/**
 * Test that the complex workload survives a serialize/deserialize round-trip.
 */
function testComplexRoundTrip() {
  const workload = workloads.complex;
  const serialized = serialize(workload);
  const deserialized = deserialize(serialized);

  assert.strictEqual(deserialized.number, 42);
  assert.strictEqual(deserialized.string, "hello");
  assert.strictEqual(deserialized.boolean, true);

  // For dates, check that the deserialized value is a Date instance with the same time.
  assert.ok(deserialized.date instanceof Date, "date should be a Date");
  assert.strictEqual(deserialized.date.getTime(), workload.date.getTime());

  // For errors, check that the deserialized value is an Error with the same message.
  assert.ok(deserialized.error instanceof Error, "error should be an Error");
  assert.strictEqual(deserialized.error.message, workload.error.message);

  // Check array and nested object
  assert.deepStrictEqual(deserialized.array, [1, 2, 3]);
  assert.deepStrictEqual(deserialized.nestedObject, { a: 1, b: 2 });
}

/**
 * Test that the recursive workload survives a serialize/deserialize round-trip.
 */
function testRecursiveRoundTrip() {
  const workload = workloads.recursive;
  const serialized = serialize(workload);
  const deserialized = deserialize(serialized);
  // Since the sample recursive workload is simply { a: 1 }, check that.
  assert.strictEqual(deserialized.a, 1);
}

/**
 * Test that the function workload survives a serialize/deserialize round-trip.
 * This verifies that function objects are correctly restored and remain callable.
 */
function testFunctionRoundTrip() {
  const workload = workloads.functionWorkload;
  const serialized = serialize(workload);
  const deserialized = deserialize(serialized);

  // Test simpleFunction
  assert.strictEqual(typeof deserialized.simpleFunction, "function", "simpleFunction should be a function");
  assert.strictEqual(deserialized.simpleFunction(), "hello world", "simpleFunction should return 'hello world'");

  // Test arrowFunction
  assert.strictEqual(typeof deserialized.arrowFunction, "function", "arrowFunction should be a function");
  assert.strictEqual(deserialized.arrowFunction(), 42, "arrowFunction should return 42");

  // Test nested.multiply
  assert.ok(deserialized.nested && typeof deserialized.nested.multiply === "function", "nested.multiply should be a function");
  assert.strictEqual(deserialized.nested.multiply(3, 4), 12, "nested.multiply should return 12 when given 3 and 4");
}

function runCorrectnessTests() {
  console.log("\n=== Correctness Tests ===");
  try {
    testBasicRoundTrip();
    console.log("Basic workload round-trip: PASS");
  } catch (error) {
    console.error("Basic workload round-trip: FAIL");
    console.error(error);
  }

  try {
    testComplexRoundTrip();
    console.log("Complex workload round-trip: PASS");
  } catch (error) {
    console.error("Complex workload round-trip: FAIL");
    console.error(error);
  }

  try {
    testRecursiveRoundTrip();
    console.log("Recursive workload round-trip: PASS");
  } catch (error) {
    console.error("Recursive workload round-trip: FAIL");
    console.error(error);
  }

  try {
    testFunctionRoundTrip();
    console.log("Function workload round-trip: PASS");
  } catch (error) {
    console.error("Function workload round-trip: FAIL");
    console.error(error);
  }
}

// ---------------------------
// Execute Tests
// ---------------------------
runLatencyTests();