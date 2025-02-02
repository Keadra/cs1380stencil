const { serialize, deserialize } = require("./distribution/util/serialization.js");
const { performance } = require("perf_hooks");

// Utility function to generate a random alphanumeric string of a given length
function generateRandomString(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Generate a basic payload of approximately `sizeInBytes`.
 * Here, we create an object with a single property containing a random string.
 */
function generateBasicPayload(sizeInBytes) {
  const data = generateRandomString(sizeInBytes);
  return { data };
}

/**
 * Generate a complex payload of approximately `sizeInBytes`.
 * This payload contains a mix of primitives, a date, an error, an array, a nested object,
 * and a random string to bring the overall size near the target.
 */
function generateComplexPayload(sizeInBytes) {
  // Estimate that the overhead for the fixed properties is ~200 bytes.
  const extraLength = Math.max(sizeInBytes - 200, 0);
  const data = generateRandomString(extraLength);
  return {
    number: 42,
    string: "hello",
    boolean: true,
    date: new Date(),
    error: new Error("Test error"),
    array: [1, 2, 3],
    nestedObject: { a: 1, b: 2 },
    data,
  };
}

/**
 * Generate a function payload of approximately `sizeInBytes`.
 * We build a function whose source includes a random string of roughly the target size.
 * The overhead for a function definition is estimated at ~100 bytes.
 */
function generateFunctionPayload(sizeInBytes) {
  const extraLength = Math.max(sizeInBytes - 100, 0);
  const randomData = generateRandomString(extraLength);
  // Use JSON.stringify to safely embed the random string in the function body.
  const simpleFunction = new Function(`return ${JSON.stringify(randomData)};`);
  
  return {
    simpleFunction,
    arrowFunction: () => simpleFunction(),
    nested: {
      multiply: function (a, b) {
        return a * b;
      },
    },
  };
}

/**
 * Measure serialization and deserialization latency for a given workload.
 * Returns the average latencies over a number of iterations and the final serialized size.
 */
function measureLatency(workload, iterations = 100) {
  const serializeTimes = [];
  const deserializeTimes = [];
  let serialized;

  for (let i = 0; i < iterations; i++) {
    // Measure serialization latency
    const startSerialize = performance.now();
    serialized = serialize(workload);
    const endSerialize = performance.now();
    serializeTimes.push(endSerialize - startSerialize);

    // Measure deserialization latency
    const startDeserialize = performance.now();
    deserialize(serialized);
    const endDeserialize = performance.now();
    deserializeTimes.push(endDeserialize - startDeserialize);
  }

  const avgSerializeLatency =
    serializeTimes.reduce((sum, t) => sum + t, 0) / iterations;
  const avgDeserializeLatency =
    deserializeTimes.reduce((sum, t) => sum + t, 0) / iterations;
  // Calculate the byte length of the serialized string (assuming UTF-8 encoding)
  const serializedSize = Buffer.byteLength(serialized, "utf8");

  return { avgSerializeLatency, avgDeserializeLatency, serializedSize };
}

/**
 * Run latency tests for basic, complex, and function workloads of a given payload size.
 */
function runLatencyTestsForSize(payloadSize) {
  console.log(`\n=== Latency Tests for Payload Size: ${payloadSize} bytes ===`);

  const basicPayload = generateBasicPayload(payloadSize);
  const complexPayload = generateComplexPayload(payloadSize);
  const functionPayload = generateFunctionPayload(payloadSize);

  const basicResults = measureLatency(basicPayload);
  const complexResults = measureLatency(complexPayload);
  const functionResults = measureLatency(functionPayload);

  console.log("\nBasic Payload:");
  console.log(`  Serialized Size: ${basicResults.serializedSize} bytes`);
  console.log(`  Avg Serialize Latency: ${basicResults.avgSerializeLatency.toFixed(4)} ms`);
  console.log(`  Avg Deserialize Latency: ${basicResults.avgDeserializeLatency.toFixed(4)} ms`);

  console.log("\nComplex Payload:");
  console.log(`  Serialized Size: ${complexResults.serializedSize} bytes`);
  console.log(`  Avg Serialize Latency: ${complexResults.avgSerializeLatency.toFixed(4)} ms`);
  console.log(`  Avg Deserialize Latency: ${complexResults.avgDeserializeLatency.toFixed(4)} ms`);

  console.log("\nFunction Payload:");
  console.log(`  Serialized Size: ${functionResults.serializedSize} bytes`);
  console.log(`  Avg Serialize Latency: ${functionResults.avgSerializeLatency.toFixed(4)} ms`);
  console.log(`  Avg Deserialize Latency: ${functionResults.avgDeserializeLatency.toFixed(4)} ms`);
}

// Run tests for a payload size of ~1KB (1024 bytes)
const PAYLOAD_SIZE = 1024;
runLatencyTestsForSize(PAYLOAD_SIZE);