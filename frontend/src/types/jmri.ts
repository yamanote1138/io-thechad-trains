export enum PowerState {
  ON = 2,
  OFF = 4,
  UNKNOWN = 0
}

export enum Direction {
  FORWARD = true,
  REVERSE = false
}

export interface Throttle {
  address: number;
  name: string;
  road: string;
  number: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  speed: number;
  direction: Direction;
  functions: Record<string, ThrottleFunction>;
}

export interface ThrottleFunction {
  label: string;
  lockable: boolean;
  value: boolean;
}

export interface Turnout {
  name: string;
  state: 'closed' | 'thrown' | 'unknown';
  inverted: boolean;
}

export interface JmriState {
  power: PowerState;
  throttles: Map<number, Throttle>;
  turnouts: Map<string, Turnout>;
}
