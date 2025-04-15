// aiAgent.test.js - Tests for AI task functionalities
const AIAgent = require('../src/ai/aiAgent');
test('AIAgent should add tasks correctly', () => {
  const agent = new AIAgent();
  agent.addTask('Test Task', async () => { return true; }, 1000);
  expect(agent.listTasks()).toContain('Test Task');
});
