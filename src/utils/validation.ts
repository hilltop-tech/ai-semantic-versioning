/**
 * Input validation utilities for semantic versioning action
 */

/**
 * List of supported OpenAI models
 */
const SUPPORTED_MODELS = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-3.5-turbo'
];

/**
 * Validates an OpenAI model name
 *
 * @param model - Model name to validate
 * @returns true if model is supported
 * @throws Error if model is not supported
 */
export function validateModel(model: string): boolean {
  if (!model || typeof model !== 'string') {
    throw new Error('Model name must be a non-empty string');
  }

  // Allow exact matches or models that start with supported prefixes
  const isValid = SUPPORTED_MODELS.some(
    supportedModel => model === supportedModel || model.startsWith(supportedModel + '-')
  );

  if (!isValid) {
    throw new Error(
      `Unsupported model: ${model}. Supported models: ${SUPPORTED_MODELS.join(', ')}`
    );
  }

  return true;
}

/**
 * Validates a semantic version string
 *
 * @param version - Version string to validate (e.g., '1.2.3')
 * @returns true if version is valid
 * @throws Error if version is invalid
 */
export function validateVersion(version: string): boolean {
  if (!version || typeof version !== 'string') {
    throw new Error('Version must be a non-empty string');
  }

  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  if (!semverRegex.test(version)) {
    throw new Error(`Invalid semantic version: ${version}`);
  }

  return true;
}

/**
 * Validates a tag prefix
 *
 * @param prefix - Tag prefix to validate
 * @returns true if prefix is valid
 * @throws Error if prefix contains invalid characters
 */
export function validateTagPrefix(prefix: string): boolean {
  if (typeof prefix !== 'string') {
    throw new Error('Tag prefix must be a string');
  }

  // Allow empty string
  if (prefix === '') {
    return true;
  }

  // Check for invalid characters
  const invalidChars = /[\s<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(prefix)) {
    throw new Error(`Tag prefix contains invalid characters: ${prefix}`);
  }

  return true;
}

/**
 * Validates bump type
 *
 * @param bumpType - Bump type to validate
 * @returns true if bump type is valid
 * @throws Error if bump type is invalid
 */
export function validateBumpType(bumpType: string): boolean {
  const validTypes = ['major', 'minor', 'patch'];

  if (!validTypes.includes(bumpType)) {
    throw new Error(
      `Invalid bump type: ${bumpType}. Must be one of: ${validTypes.join(', ')}`
    );
  }

  return true;
}
