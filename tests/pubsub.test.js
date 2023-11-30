const { PubSub, Logs, Errors } = require('..')

describe('PubSub Class', () => {
  let testPubSub;

  beforeEach(() => {
    testPubSub = new PubSub('TestPubSub', ['testEvent']);
  });

  describe('Construction', () => {
    test('should create a new PubSub instance', () => {
      expect(testPubSub).toBeInstanceOf(PubSub);
      expect(testPubSub.name).toBe('TestPubSub');
    });

    test('should track publishes if option is set', () => {
      const trackPubSub = new PubSub('TrackPubSub', ['trackEvent'], { trackPublishes: true });
      expect(trackPubSub.trackedPublishes).toBeInstanceOf(Map);
    });
  });

  describe('Event Handling', () => {
    test('should add a new event', () => {
      testPubSub.addEvent('newEvent');
      expect(testPubSub.trackedEvents.has('newEvent')).toBeTruthy();
    });

    test('should allow subscribing to an event', async () => {
      const mockHandler = jest.fn();
      testPubSub.listen('testEvent', mockHandler);

      await testPubSub.publish('testEvent');
      expect(mockHandler).toHaveBeenCalled();
    });

    test('should remove a subscriber from an event', async () => {
      const mockHandler = jest.fn();
      testPubSub.listen('testEvent', mockHandler);
      testPubSub.unlisten('testEvent', mockHandler);

      await testPubSub.publish('testEvent');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    test('should handle publishing events with arguments', async () => {
      const mockHandler = jest.fn();
      testPubSub.listen('testEvent', mockHandler);

      await testPubSub.publish('testEvent', 'arg1', 'arg2');
      expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('should be able to reduce a value', async () => {
      testPubSub.listen('testEvent', (current) => (current + 1));
      testPubSub.listen('testEvent', (current) => (current + 2));

      let result = await testPubSub.reduce('testEvent', 0);
      expect(result).toBe(3);
    });
  });

  describe('Special Cases', () => {
    test('should throw error for untracked events on publish', async () => {
      await expect(testPubSub.publish('nonexistentEvent')).rejects.toThrow();
    });
  });

  describe('Logs and Errors Instances', () => {
    test('should log messages with Logs instance', () => {
      const mockLog = jest.spyOn(console, 'log');
      Logs.log('test log');
      expect(mockLog).toHaveBeenCalledWith('test log');
    });

    test('should capture errors with Errors instance', () => {
      jest.spyOn(console, 'error').mockImplementation(() => { })
      const testError = new Error('Test Error');
      const mockError = jest.spyOn(console, 'error');
      Errors.capture(testError);
      expect(mockError).toHaveBeenCalledWith(testError);
      console.error.mockRestore()
    });
  });

  describe('Console Replacement', () => {
    test('should replace and restore the console', () => {
      const originalConsole = console;
      Logs.replace();
      expect(console).not.toBe(originalConsole);

      Logs.restore();
      expect(console).toBe(originalConsole);
    });
  });
});

