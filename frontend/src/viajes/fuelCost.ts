export function estimateFuelBudget(kilometers: number, kilometersPerLiterInput: string, pricePerLiterInput: string): number | null {
  const kilometersPerLiter = parsePositiveNumber(kilometersPerLiterInput);
  const pricePerLiter = parsePositiveNumber(pricePerLiterInput);

  if (!Number.isFinite(kilometers) || kilometers <= 0 || kilometersPerLiter == null || pricePerLiter == null) {
    return null;
  }

  return Math.round((kilometers / kilometersPerLiter) * pricePerLiter);
}

export function parsePositiveNumber(input: string): number | null {
  const value = Number(input.replace(',', '.'));
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}
