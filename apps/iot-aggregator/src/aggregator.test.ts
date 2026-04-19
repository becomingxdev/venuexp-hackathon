import { Aggregator } from './aggregator';
import { IoTEvent } from '@venuexp/shared';

describe('Aggregator', () => {
  let aggregator: Aggregator;

  beforeEach(() => {
    aggregator = new Aggregator();
  });

  it('should initially be empty and flush empty', () => {
    const result = aggregator.flush();
    expect(result).toEqual([]);
  });

  it('should aggregate events correctly', () => {
    const event1: IoTEvent = { deviceId: 'd1', sensorType: 'turnstile', count: 10, zoneId: 'z1', timestamp: Date.now() };
    const event2: IoTEvent = { deviceId: 'd2', sensorType: 'ir_counter', count: 5, zoneId: 'z1', timestamp: Date.now() };
    
    aggregator.addEvent(event1);
    aggregator.addEvent(event2);

    const result = aggregator.flush();
    expect(result).toHaveLength(1);
    const first = result[0];
    if(first) {
      expect(first.zoneId).toBe('z1');
      expect(first.predictedWait).toBeGreaterThan(0);
    }
    
    // Test that the buffer is cleared
    expect(aggregator.flush()).toEqual([]);
  });

  it('should calculate positive trend if turnstile increases > half', () => {
    const event1: IoTEvent = { deviceId: 'd1', sensorType: 'turnstile', count: 1, zoneId: 'z1', timestamp: Date.now() };
    const event2: IoTEvent = { deviceId: 'd2', sensorType: 'turnstile', count: 2, zoneId: 'z1', timestamp: Date.now() };
    const event3: IoTEvent = { deviceId: 'd3', sensorType: 'ir_counter', count: 1, zoneId: 'z1', timestamp: Date.now() };
    
    aggregator.addEvent(event1);
    aggregator.addEvent(event2);
    aggregator.addEvent(event3);

    const result = aggregator.flush();
    const first = result[0];
    if (first) {
      expect(first.trend).toBe(1);
    }
  });

  it('should calculate negative trend if turnstile increases < half', () => {
    const event1: IoTEvent = { deviceId: 'd1', sensorType: 'ir_counter', count: 1, zoneId: 'z1', timestamp: Date.now() };
    const event2: IoTEvent = { deviceId: 'd2', sensorType: 'ir_counter', count: 2, zoneId: 'z1', timestamp: Date.now() };
    const event3: IoTEvent = { deviceId: 'd3', sensorType: 'turnstile', count: 1, zoneId: 'z1', timestamp: Date.now() };
    
    aggregator.addEvent(event1);
    aggregator.addEvent(event2);
    aggregator.addEvent(event3);

    const result = aggregator.flush();
    const first = result[0];
    if (first) {
      expect(first.trend).toBe(-1);
    }
  });

  it('should calculate zero trend if turnstile increases == half', () => {
    const event1: IoTEvent = { deviceId: 'd1', sensorType: 'ir_counter', count: 1, zoneId: 'z1', timestamp: Date.now() };
    const event2: IoTEvent = { deviceId: 'd2', sensorType: 'turnstile', count: 2, zoneId: 'z1', timestamp: Date.now() };
    
    aggregator.addEvent(event1);
    aggregator.addEvent(event2);
    
    const result = aggregator.flush();
    const first = result[0];
    if (first) {
      expect(first.trend).toBe(0);
    }
  });
});
