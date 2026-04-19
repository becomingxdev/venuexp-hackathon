import { IoTEvent, CrowdState } from '@venuexp/shared';

/**
 * Pure aggregation logic. 
 * Groups raw sensor events into zone-level density updates.
 */
export class Aggregator {
  private buffer: Map<string, IoTEvent[]> = new Map();

  /**
   * Add a new event to the internal buffer.
   */
  addEvent(event: IoTEvent): void {
    const events = this.buffer.get(event.zoneId) || [];
    events.push(event);
    this.buffer.set(event.zoneId, events);
  }

  /**
   * Flushes the buffer and returns aggregated states.
   * This handles the batch processing requirement.
   */
  flush(): CrowdState[] {
    const results: CrowdState[] = [];
    const now = new Date().toISOString();

    for (const [zoneId, events] of this.buffer.entries()) {
      if (events.length === 0) continue;

      // Calculate total count in this batch
      const totalBatchCount = events.reduce((sum, e) => sum + e.count, 0);
      
      // Calculate trend based on batch events
      // Simple heuristic: if most events come from 'turnstile' (inlet), trend is positive
      const trend = this.calculateTrend(events);

      // In a real system, density would be derived from complex occupancy tracking
      // Here we simulate it by using the batch count as a delta
      const mockDensity = Math.min(5.0, Math.max(0, 2.5 + (totalBatchCount / 100)));

      results.push({
        zoneId,
        density: mockDensity,
        lastUpdated: now,
        trend,
        predictedWait: Math.round(mockDensity * 4), // Heuristic: 4 mins per density point
      });
    }

    this.buffer.clear();
    return results;
  }

  private calculateTrend(events: IoTEvent[]): number {
    const count = events.length;
    if (count === 0) return 0;
    
    // Simple logic for simulation:
    const increases = events.filter(e => e.sensorType === 'turnstile').length;
    if (increases > count / 2) return 1;
    if (increases < count / 2) return -1;
    return 0;
  }
}
