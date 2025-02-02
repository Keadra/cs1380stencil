const { serialize, deserialize } = require("./serializer");
const { performance } = require("perf_hooks");

// 定义三种工作负载
const workloads = {
  basic: { a: 42, b: "hello", c: true, d: null, e: undefined }, // 基本类型
  complex: {
    number: 42,
    string: "hello",
    boolean: true,
    date: new Date(),
    error: new Error("Test error"),
    array: [1, 2, 3],
    nestedObject: { a: 1, b: 2 },
  }, // 复杂对象
  recursive: (() => {
    const obj = { a: 1 };
    obj.b = obj; // 创建循环引用
    return obj;
  })(), // 递归结构
};

// 测量延迟的函数
function measureLatency(workload, iterations = 100) {
  const serializeTimes = [];
  const deserializeTimes = [];

  for (let i = 0; i < iterations; i++) {
    // 测量序列化时间
    const startSerialize = performance.now();
    const serialized = serialize(workload);
    const endSerialize = performance.now();
    serializeTimes.push(endSerialize - startSerialize);

    // 测量反序列化时间
    const startDeserialize = performance.now();
    deserialize(serialized);
    const endDeserialize = performance.now();
    deserializeTimes.push(endDeserialize - startDeserialize);
  }

  // 计算平均延迟
  const avgSerializeLatency =
    serializeTimes.reduce((sum, time) => sum + time, 0) / iterations;
  const avgDeserializeLatency =
    deserializeTimes.reduce((sum, time) => sum + time, 0) / iterations;

  return { avgSerializeLatency, avgDeserializeLatency };
}

// 运行测试
function runTests() {
  const results = {};

  for (const [name, workload] of Object.entries(workloads)) {
    results[name] = measureLatency(workload);
  }

  // 打印结果
  console.log("Latency Results:");
  for (const [name, { avgSerializeLatency, avgDeserializeLatency }] of Object.entries(results)) {
    console.log(`Workload: ${name}`);
    console.log(`  Average Serialize Latency: ${avgSerializeLatency.toFixed(4)} ms`);
    console.log(`  Average Deserialize Latency: ${avgDeserializeLatency.toFixed(4)} ms`);
  }
}

// 执行测试
runTests();