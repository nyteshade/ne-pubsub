import { PubSub, Logs, Errors } from './pubsub.js'

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

    test('should allow subscribing to an event', () => {
      const mockHandler = jest.fn();
      testPubSub.listen('testEvent', mockHandler);

      testPubSub.publish('testEvent');
      expect(mockHandler).toHaveBeenCalled();
    });

    test('should remove a subscriber from an event', () => {
      const mockHandler = jest.fn();
      testPubSub.listen('testEvent', mockHandler);
      testPubSub.unlisten('testEvent', mockHandler);

      testPubSub.publish('testEvent');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    test('should handle publishing events with arguments', () => {
      const mockHandler = jest.fn();
      testPubSub.listen('testEvent', mockHandler);

      testPubSub.publish('testEvent', 'arg1', 'arg2');
      expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('Special Cases', () => {
    test('should throw error for untracked events on publish', () => {
      expect(() => {
        testPubSub.publish('nonexistentEvent');
      }).toThrow();
    });
  });

  describe('Logs and Errors Instances', () => {
    test('should log messages with Logs instance', () => {
      const mockLog = jest.spyOn(console, 'log');
      Logs.log('test log');
      expect(mockLog).toHaveBeenCalledWith('test log');
    });

    test('should capture errors with Errors instance', () => {
      const testError = new Error('Test Error');
      const mockError = jest.spyOn(console, 'error');
      Errors.capture(testError);
      expect(mockError).toHaveBeenCalledWith(testError);
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

