export enum PowerState {
  ON = 2,
  OFF = 4,
  UNKNOWN = 0
}

export enum Direction {
  FORWARD = true,
  REVERSE = false
}

export interface RosterEntry {
  address: number;
  name: string;
  road: string;
  number: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export interface Throttle extends RosterEntry {
  speed: number;
  direction: Direction;
  functions: Record<string, ThrottleFunction>;
}

export interface ThrottleFunction {
  label: string;
  lockable: boolean;
  value: boolean;
}

export interface JmriState {
  power: PowerState;
  roster: Map<number, RosterEntry>;
  throttles: Map<number, Throttle>;
}
