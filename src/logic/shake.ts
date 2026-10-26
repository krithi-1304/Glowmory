export function shakeIntensity(values: number[]): number {
  if (values.length < 3) return 0;
  const peaks = values.filter(
    (value, index) =>
      index > 0 &&
      Math.abs(value) > 6 &&
      Math.sign(value) !== Math.sign(values[index - 1]!),
  );
  return Math.min(
    1,
    peaks.reduce((sum, value) => sum + Math.abs(value), 0) /
      Math.max(1, peaks.length) /
      20,
  );
}
