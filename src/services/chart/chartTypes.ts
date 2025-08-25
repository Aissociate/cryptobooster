export interface OHLCData {
  ts: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface PriceData {
  ts: number;
  p: number;
}

export interface ChartUrls {
  W: string;
  D: string;
  "12H": string;
  "4H": string;
  "1H": string;
}