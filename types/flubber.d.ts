declare module 'flubber' {
  export function interpolate(
    fromShape: string,
    toShape: string,
    options?: {
      maxSegmentLength?: number;
      string?: boolean;
    }
  ): (t: number) => string;

  export function toPathString(ring: [number, number][]): string;

  export function fromCircle(
    cx: number,
    cy: number,
    r: number,
    options?: { maxSegmentLength?: number }
  ): string;

  export function toCircle(
    shape: string,
    cx: number,
    cy: number,
    r: number,
    options?: { maxSegmentLength?: number }
  ): (t: number) => string;

  export function fromRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: { maxSegmentLength?: number }
  ): string;

  export function toRect(
    shape: string,
    x: number,
    y: number,
    width: number,
    height: number,
    options?: { maxSegmentLength?: number }
  ): (t: number) => string;

  export function separate(
    fromShape: string,
    toShapes: string[],
    options?: { maxSegmentLength?: number }
  ): ((t: number) => string)[];

  export function combine(
    fromShapes: string[],
    toShape: string,
    options?: { maxSegmentLength?: number }
  ): ((t: number) => string)[];

  export function interpolateAll(
    fromShapes: string[],
    toShapes: string[],
    options?: {
      maxSegmentLength?: number;
      string?: boolean;
      single?: boolean;
    }
  ): ((t: number) => string)[] | ((t: number) => string);
}
