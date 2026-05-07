/**
 * ValidationResult — shared contract for all validators.
 * Kept in its own file so no validator has to import from another.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
