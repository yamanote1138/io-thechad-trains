import type { PowerState } from 'jmri-client'

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
  functionKeys?: Record<string, string>; // e.g., { "F0": "Headlight", "F1": "Bell" }
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
