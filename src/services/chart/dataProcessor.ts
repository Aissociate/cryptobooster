import { OHLCData, PriceData } from './chartTypes';

export class ChartDataProcessor {
  static resampleOHLC(rows: OHLCData[], bucketMs: number): OHLCData[] {
    const buckets = new Map<number, OHLCData>();
    
    for (const k of rows) {
      const ts = k.ts;
      const bucket = Math.floor(ts / bucketMs) * bucketMs;
      let b = buckets.get(bucket);
      if (!b) {
        b = { ts: bucket, o: k.o, h: k.h, l: k.l, c: k.c };
        buckets.set(bucket, b);
      } else {
        b.h = Math.max(b.h, k.h);
        b.l = Math.min(b.l, k.l);
        b.c = k.c;
      }
    }
    
    return [...buckets.values()].sort((a, b) => a.ts - b.ts);
  }

  static resamplePricesToOHLC(prices: PriceData[], bucketMs: number): OHLCData[] {
    const buckets = new Map<number, OHLCData>();
    
    for (const r of prices) {
      const bucket = Math.floor(r.ts / bucketMs) * bucketMs;
      let b = buckets.get(bucket);
      if (!b) {
        b = { ts: bucket, o: r.p, h: r.p, l: r.p, c: r.p };
        buckets.set(bucket, b);
      } else {
        b.h = Math.max(b.h, r.p);
        b.l = Math.min(b.l, r.p);
        b.c = r.p;
      }
    }
    
    return [...buckets.values()].sort((a, b) => a.ts - b.ts);
  }
}