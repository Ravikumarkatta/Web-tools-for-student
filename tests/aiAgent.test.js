// aiAgent.test.js - Tests for AI task functionalities
const AIAgent = require('../src/ai/aiAgent');
const { analyzeData } = require('../src/ai/aiAgent');

test('AIAgent should add tasks correctly', () => {
  const agent = new AIAgent();
  agent.addTask('Test Task', async () => { return true; }, 1000);
  expect(agent.listTasks()).toContain('Test Task');
});

describe('AI Agent - analyzeData', () => {
  test('should return correct analysis for valid input', () => {
    const input = [1, 2, 3, 4, 5];
    const result = analyzeData(input);
    expect(result).toHaveProperty('average');
    expect(result.average).toBe(3);
  });

  test('should throw an error for invalid input', () => {
    const input = 'invalid';
    expect(() => analyzeData(input)).toThrow('Invalid input');
  });
});
