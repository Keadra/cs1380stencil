/*
    Checklist:

    1. Serialize strings
    2. Serialize numbers
    3. Serialize booleans
    4. Serialize (non-circular) Objects
    5. Serialize (non-circular) Arrays
    6. Serialize undefined and null
    7. Serialize Date, Error objects
    8. Serialize (non-native) functions
    9. Serialize circular objects and arrays
    10. Serialize native functions
*/

function serialize(object) {
  const seen = new WeakSet(); // 用于检测循环引用

  function _serialize(obj) {
      // 处理基本类型
      if (obj === null) {
          return { t: "null", v: "null" }; // t 表示 type，v 表示 value
      }
      if (obj === undefined) {
          return { t: "undefined", v: "undefined" };
      }
      if (typeof obj === "number") {
          return { t: "Number", v: obj.toString() };
      }
      if (typeof obj === "string") {
          return { t: "String", v: obj };
      }
      if (typeof obj === "boolean") {
          return { t: "Boolean", v: obj.toString() };
      }

      // 处理复杂类型
      if (obj instanceof Date) {
          return { t: "Date", v: obj.toISOString() };
      }
      if (obj instanceof Error) {
          return { t: "Error", v: { message: obj.message, stack: obj.stack } };
      }
      if (typeof obj === "function") {
          return { t: "Function", v: obj.toString() };
      }

      // 处理对象和数组
      if (typeof obj === "object") {
          if (seen.has(obj)) {
              throw new Error("Circular reference detected");
          }
          seen.add(obj);

          if (Array.isArray(obj)) {
              return { t: "Array", v: obj.map(_serialize) };
          } else {
              const result = {};
              for (const key in obj) {
                  if (obj.hasOwnProperty(key)) {
                      result[key] = _serialize(obj[key]);
                  }
              }
              return { t: "Object", v: result };
          }
      }

      throw new Error("Unsupported type for serialization");
  }

  return JSON.stringify(_serialize(object));
}

function deserialize(string) {
  const parsed = JSON.parse(string);

  function _deserialize(obj) {
      if (obj.t === "null") {
          return null;
      }
      if (obj.t === "undefined") {
          return undefined;
      }
      if (obj.t === "Number") {
          return parseFloat(obj.v);
      }
      if (obj.t === "String") {
          return obj.v;
      }
      if (obj.t === "Boolean") {
          return obj.v === "true";
      }
      if (obj.t === "Date") {
          return new Date(obj.v);
      }
      if (obj.t === "Error") {
          const error = new Error(obj.v.message);
          error.stack = obj.v.stack;
          return error;
      }
      if (obj.t === "Function") {
          return eval(`(${obj.v})`); // 注意：eval 有安全风险，仅用于示例
      }
      if (obj.t === "Array") {
          return obj.v.map(_deserialize);
      }
      if (obj.t === "Object") {
          const result = {};
          for (const key in obj.v) {
              if (obj.v.hasOwnProperty(key)) {
                  result[key] = _deserialize(obj.v[key]);
              }
          }
          return result;
      }

      throw new Error("Unsupported type for deserialization");
  }

  return _deserialize(parsed);
}

module.exports = {
  serialize: serialize,
  deserialize: deserialize,
};