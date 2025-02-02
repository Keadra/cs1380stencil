/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
*/

const distribution = require('../config.js');
// M1 Test Cases

test('m1: sample test', () => {
  const object = {milestone: 'm1', status: 'complete'};
  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);

  expect(deserialized).toEqual(object);
});

test("serialize and deserialize number", () => {
  const original = 322; 
  const serialized = distribution.util.serialize(original); 
  const deserialized = distribution.util.deserialize(serialized); 
  expect(deserialized).toBe(original); 
});

test("serialize and deserialize string", () => {
  const original = "nihao"; 
  const serialized = distribution.util.serialize(original);
  const deserialized = distribution.util.deserialize(serialized); 
  expect(deserialized).toBe(original); 
});

test("serialize and deserialize boolean", () => {
  const original = true; 
  const serialized = distribution.util.serialize(original); 
  const deserialized = distribution.util.deserialize(serialized); 
  expect(deserialized).toBe(original); 
});

test("serialize and deserialize null", () => {
  const original = null; 
  const serialized = distribution.util.serialize(original);
  const deserialized = distribution.util.deserialize(serialized); 
  expect(deserialized).toBe(original); 
});
test("serialize and deserialize undefined", () => {
  const original = undefined; 
  const serialized =distribution.util.serialize(original);
  const deserialized = distribution.util.deserialize(serialized); 
  expect(deserialized).toBe(original); 
});

// M2 Test Cases

// M3 Test Cases

// M4 Test Cases

// M5 Test Cases
