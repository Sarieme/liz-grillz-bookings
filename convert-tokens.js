/**
 * Design Tokens to CSS Variables Converter
 * ----------------------------------------------------------------------------
 * Project: Liz's Grillz Bookings
 * Description:
 *   Converts the design system tokens JSON exported from Figma/Tokens Studio
 *   into a production-ready CSS variables stylesheet.
 *
 * Architecture & Standard Color System Practice:
 *   - Tier 1: Primitives (Reference/Foundational Tokens)
 *     Raw values for key colors and 0-100 tonal palettes (primary, secondary,
 *     tertiary, neutral, neutral-variant, error, warning).
 *     RULE: Primitives are internal reference variables (--color-primitive-*)
 *     and MUST NOT be used directly on UI components.
 *
 *   - Tier 2: Color Roles (Semantic / Component UI Tokens)
 *     Semantic mappings (primary, on-primary, surface, on-surface, background,
 *     outline, error, etc.) that link to primitives using var(--color-primitive-*).
 *     RULE: Color roles (--color-*) are the ONLY color tokens that should be
 *     used directly when styling buttons, surfaces, text, inputs, and cards.
 *
 *   - Tier 3: Effects & Typography
 *     Shadows (--shadow-*) and typography scale (--font-*, --line-height-*, etc.)
 *     along with ready-to-use utility classes.
 *
 * Single Source of Truth:
 *   Whenever the design tokens JSON is updated, re-running this script
 *   regenerates the CSS variables automatically.
 *
 * Usage:
 *   node convert-tokens.js
 *   node convert-tokens.js [inputFile] [outputFile]
 *   node convert-tokens.js --input <path> --output <path> [--watch]
 * ----------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

// Configuration Defaults
const DEFAULT_INPUT_CANDIDATES = [
  path.join(__dirname, 'design-tokens.tokens (1).json'),
  path.join(__dirname, 'design-tokens.tokens.json'),
  path.join(__dirname, 'design-tokens.json'),
  path.join(__dirname, 'tokens.json')
];
const DEFAULT_OUTPUT = path.join(__dirname, 'tokens.css');

/**
 * Converts a string to clean kebab-case.
 * @param {string} str
 * @returns {string}
 */
function toKebabCase(str) {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Normalizes 8-digit or 6-digit hex colors into standard CSS colors.
 * Converts #rrggbbaa with 100% alpha (ff) into #rrggbb.
 * Converts transparent colors into rgba() or preserves hex8.
 * @param {string} hex
 * @returns {string}
 */
function normalizeColor(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  const cleanHex = hex.trim();

  // 8-digit hex: #rrggbbaa
  if (cleanHex.length === 9) {
    const r = parseInt(cleanHex.slice(1, 3), 16);
    const g = parseInt(cleanHex.slice(3, 5), 16);
    const b = parseInt(cleanHex.slice(5, 7), 16);
    const aHex = cleanHex.slice(7, 9).toLowerCase();
    const a = Math.round((parseInt(aHex, 16) / 255) * 1000) / 1000;

    // Fully opaque -> standard 6-digit hex
    if (aHex === 'ff') {
      return '#' + cleanHex.slice(1, 7).toLowerCase();
    }
    // With transparency -> clean rgba()
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // 6-digit hex or 3-digit hex
  return cleanHex.toLowerCase();
}

/**
 * Formats a dropShadow token into a valid CSS box-shadow property string.
 * @param {object} shadowValue
 * @returns {string}
 */
function formatBoxShadow(shadowValue) {
  if (!shadowValue || typeof shadowValue !== 'object') return 'none';
  const offsetX = shadowValue.offsetX !== undefined ? `${shadowValue.offsetX}px` : '0px';
  const offsetY = shadowValue.offsetY !== undefined ? `${shadowValue.offsetY}px` : '0px';
  const radius = shadowValue.radius !== undefined ? `${shadowValue.radius}px` : '0px';
  const spread = shadowValue.spread !== undefined ? `${shadowValue.spread}px` : '0px';
  const color = normalizeColor(shadowValue.color) || 'rgba(0, 0, 0, 0.2)';

  return `${offsetX} ${offsetY} ${radius} ${spread} ${color}`;
}

/**
 * Extracts numeric tone from a palette token name (e.g. "primary40" -> "40", "primary 0" -> "0").
 * Handles exceptions like "warning key color0 2" -> "10".
 * @param {string} palKey
 * @param {string} tokenKey
 * @returns {string}
 */
function extractTone(palKey, tokenKey) {
  // Special case: Figma duplicated 0 as "warning key color0 2" for tone 10 (#2c1600ff)
  if (palKey === 'warning key color' && tokenKey.includes('0 2')) {
    return '10';
  }

  // Strip the palette prefix
  const stripped = tokenKey.replace(new RegExp(`^${palKey}\\s*`, 'i'), '').trim();
  const numMatch = stripped.match(/\d+/);
  if (numMatch) {
    return numMatch[0];
  }

  // Fallback to searching the entire key for numbers
  const allNum = tokenKey.match(/\d+/g);
  return allNum ? allNum.join('-') : toKebabCase(tokenKey);
}

/**
 * Parses and builds the design token registry.
 * Maps exact JSON reference paths to CSS variable names and raw values.
 * @param {object} tokensData
 * @returns {{ registry: Map<string, object>, primitives: object, roles: object, effects: object, typography: object }}
 */
function buildTokenRegistry(tokensData) {
  const registry = new Map();

  const result = {
    primitives: {
      keyColors: [],
      palettes: {}
    },
    roles: [],
    effects: [],
    typography: []
  };

  // -------------------------------------------------------------------------
  // 1. Process Primitives: Key Colors (Foundational Seed Colors)
  // -------------------------------------------------------------------------
  const keyColorsObj = tokensData?.primitives?.['key colors'] || {};
  for (const [keyName, token] of Object.entries(keyColorsObj)) {
    const cleanName = toKebabCase(keyName.replace(/key\s*color/i, '').replace(/color/i, '').trim());
    const varName = `--color-primitive-key-${cleanName}`;
    const rawValue = normalizeColor(token.value);
    const exactPath = `primitives.key colors.${keyName}`;

    const item = {
      originalKey: keyName,
      varName,
      rawValue,
      description: token.description || null
    };

    result.primitives.keyColors.push(item);
    registry.set(exactPath, item);
    registry.set(exactPath.toLowerCase(), item);
  }

  // -------------------------------------------------------------------------
  // 2. Process Primitives: Tonal Palettes (0 to 100 Tones)
  // -------------------------------------------------------------------------
  const palettesObj = tokensData?.primitives?.['color palletes'] || {};
  for (const [palKey, tokens] of Object.entries(palettesObj)) {
    const cleanPalName = toKebabCase(palKey.replace(/key\s*color/i, '').trim());
    result.primitives.palettes[cleanPalName] = [];

    for (const [tokenKey, token] of Object.entries(tokens)) {
      const tone = extractTone(palKey, tokenKey);
      const varName = `--color-primitive-${cleanPalName}-${tone}`;
      const rawValue = normalizeColor(token.value);
      const exactPath = `primitives.color palletes.${palKey}.${tokenKey}`;

      const item = {
        originalKey: tokenKey,
        palette: cleanPalName,
        tone,
        varName,
        rawValue
      };

      result.primitives.palettes[cleanPalName].push(item);
      registry.set(exactPath, item);
      registry.set(exactPath.toLowerCase(), item);
    }

    // Sort tones numerically (0, 10, 20, 30 ... 100)
    result.primitives.palettes[cleanPalName].sort((a, b) => {
      const toneA = parseFloat(a.tone.replace('-', '.')) || 0;
      const toneB = parseFloat(b.tone.replace('-', '.')) || 0;
      return toneA - toneB;
    });
  }

  // -------------------------------------------------------------------------
  // 3. Process Color Roles (Semantic UI Tokens)
  // -------------------------------------------------------------------------
  const rolesObj = tokensData?.['color roles'] || {};
  for (const [roleName, token] of Object.entries(rolesObj)) {
    const varName = `--color-${toKebabCase(roleName)}`;
    const val = token.value;

    let targetVar = null;
    let fallbackVal = null;

    if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
      const refPath = val.slice(1, -1);
      const registered = registry.get(refPath) || registry.get(refPath.toLowerCase());
      if (registered) {
        targetVar = registered.varName;
        fallbackVal = registered.rawValue;
      } else {
        console.warn(`[Tokens Parser] Unknown alias reference: "${refPath}"`);
        targetVar = `--color-primitive-${toKebabCase(refPath.split('.').pop())}`;
      }
    } else {
      // Direct color literal (e.g. "on error: #ffffffff")
      fallbackVal = normalizeColor(val);
    }

    const item = {
      roleName,
      varName,
      targetVar,
      fallbackVal,
      rawValue: fallbackVal,
      description: token.description || ''
    };

    result.roles.push(item);
    registry.set(`color roles.${roleName}`, item);
    registry.set(`color roles.${roleName}`.toLowerCase(), item);
  }

  // -------------------------------------------------------------------------
  // 4. Process Effects (Shadows)
  // -------------------------------------------------------------------------
  const effectsObj = tokensData?.effect || {};
  for (const [effectName, token] of Object.entries(effectsObj)) {
    const cleanName = toKebabCase(effectName);
    const varName = `--shadow-${cleanName.replace('-shadow', '')}`;
    const cssValue = formatBoxShadow(token.value);

    const item = {
      effectName,
      varName,
      cssValue,
      raw: token.value
    };

    result.effects.push(item);
    registry.set(`effect.${effectName}`, item);
  }

  // -------------------------------------------------------------------------
  // 5. Process Typography
  // -------------------------------------------------------------------------
  const typoObj = tokensData?.typography || {};
  for (const [typoName, properties] of Object.entries(typoObj)) {
    const cleanName = toKebabCase(typoName);
    const item = {
      name: typoName,
      slug: cleanName,
      fontSize: properties.fontSize?.value ? `${properties.fontSize.value}px` : '16px',
      fontSizeNum: properties.fontSize?.value || 16,
      lineHeight: properties.lineHeight?.value ? `${properties.lineHeight.value}px` : '1.5',
      lineHeightNum: properties.lineHeight?.value || 24,
      fontWeight: properties.fontWeight?.value || 400,
      fontFamily: properties.fontFamily?.value || 'DM Sans',
      letterSpacing: properties.letterSpacing?.value !== undefined ? `${properties.letterSpacing.value}px` : 'normal'
    };

    result.typography.push(item);
    registry.set(`typography.${typoName}`, item);
  }

  return { registry, ...result };
}

/**
 * Generates the complete CSS stylesheet string from parsed design tokens.
 * @param {object} parsed
 * @param {string} sourceFile
 * @returns {string}
 */
function generateCSS(parsed, sourceFile = 'design-tokens.tokens.json') {
  const timestamp = new Date().toISOString();

  let css = `/**
 * ============================================================================
 * DESIGN SYSTEM TOKENS - CSS VARIABLES
 * ============================================================================
 * Source: ${path.basename(sourceFile)}
 * Generated: ${timestamp}
 *
 * ARCHITECTURAL GUIDELINES (PLEASE READ BEFORE USING):
 * ----------------------------------------------------------------------------
 * 1. UI IMPLEMENTATION (COLOR ROLES):
 *    -> ALWAYS use Color Roles (--color-*) on UI components (buttons, cards,
 *       typography, borders, navigation, inputs, backgrounds).
 *    -> Color roles carry semantic meaning and automatically adapt if themes
 *       or primitive palettes change.
 *
 * 2. PRIMITIVE TOKENS (--color-primitive-*):
 *    -> Primitives are foundational, mathematical color scales (0 to 100).
 *    -> They serve as the internal reference definitions for Color Roles.
 *    -> DO NOT use primitive variables directly in UI component styles.
 *
 * 3. SINGLE SOURCE OF TRUTH:
 *    -> This CSS file is auto-generated by "convert-tokens.js".
 *    -> Do NOT edit values directly in this file; update the design tokens JSON
 *       and re-run: "node convert-tokens.js"
 * ============================================================================
 */

:root {
  /* ==========================================================================
   * 1. PRIMITIVE KEY COLORS (Seed / Brand Reference Values)
   * Internal reference only. Do NOT use directly on UI components.
   * ========================================================================== */
`;

  // Key Colors
  for (const keyColor of parsed.primitives.keyColors) {
    css += `  ${keyColor.varName}: ${keyColor.rawValue}; /* ${keyColor.originalKey} */\n`;
  }

  // Tonal Palettes
  css += `\n  /* ==========================================================================
   * 2. PRIMITIVE TONAL PALETTES (0 to 100 Tones)
   * Internal reference only. Do NOT use directly on UI components.
   * ========================================================================== */\n`;

  for (const [palName, tokens] of Object.entries(parsed.primitives.palettes)) {
    css += `\n  /* --- Palette: ${palName.toUpperCase()} --- */\n`;
    for (const token of tokens) {
      css += `  ${token.varName}: ${token.rawValue};\n`;
    }
  }

  // Semantic Color Roles
  css += `\n  /* ==========================================================================
   * 3. SEMANTIC COLOR ROLES (PRIMARY UI TOKENS)
   * --------------------------------------------------------------------------
   * USE THESE VARIABLES FOR ALL UI IMPLEMENTATION!
   * - Buttons, text, backgrounds, cards, inputs, icons, and borders.
   * - Each role is mapped to an internal primitive via var(--color-primitive-*).
   * ========================================================================== */\n`;

  // Group roles logically for superior developer readability
  const roleGroups = [
    {
      title: 'Core Brand & Interaction: Primary',
      filter: (r) => r.roleName.includes('primary')
    },
    {
      title: 'Brand Accent: Secondary',
      filter: (r) => r.roleName.includes('secondary')
    },
    {
      title: 'Brand Accent: Tertiary',
      filter: (r) => r.roleName.includes('tertiary')
    },
    {
      title: 'Surfaces, Backgrounds & Canvas',
      filter: (r) => r.roleName.includes('surface') || r.roleName.includes('background')
    },
    {
      title: 'Outlines, Dividers & Borders',
      filter: (r) => r.roleName.includes('outline')
    },
    {
      title: 'Feedback & Alert: Error',
      filter: (r) => r.roleName.includes('error')
    },
    {
      title: 'Elevation, Scrim & Shadow Tints',
      filter: (r) => r.roleName === 'scrim' || r.roleName === 'shadow'
    }
  ];

  const processedRoles = new Set();

  for (const group of roleGroups) {
    const groupRoles = parsed.roles.filter(r => !processedRoles.has(r.roleName) && group.filter(r));
    if (groupRoles.length > 0) {
      css += `\n  /* --- ${group.title} --- */\n`;
      for (const role of groupRoles) {
        processedRoles.add(role.roleName);
        if (role.targetVar) {
          css += `  ${role.varName}: var(${role.targetVar}); /* ${role.roleName} -> ${role.rawValue || ''} */\n`;
        } else {
          css += `  ${role.varName}: ${role.fallbackVal}; /* ${role.roleName} */\n`;
        }
      }
    }
  }

  // Any remaining roles
  const remainingRoles = parsed.roles.filter(r => !processedRoles.has(r.roleName));
  if (remainingRoles.length > 0) {
    css += `\n  /* --- Additional Color Roles --- */\n`;
    for (const role of remainingRoles) {
      if (role.targetVar) {
        css += `  ${role.varName}: var(${role.targetVar}); /* ${role.roleName} */\n`;
      } else {
        css += `  ${role.varName}: ${role.fallbackVal}; /* ${role.roleName} */\n`;
      }
    }
  }

  // Shadows & Effects
  css += `\n  /* ==========================================================================
   * 4. ELEVATION & SHADOW EFFECTS
   * Drop shadows for cards, popovers, modals, and sticky headers.
   * ========================================================================== */\n`;

  for (const effect of parsed.effects) {
    css += `  ${effect.varName}: ${effect.cssValue}; /* ${effect.effectName} */\n`;
  }
  // Standard aliases for developer ergonomics
  css += `  --shadow-sm: var(--shadow-soft);\n`;
  css += `  --shadow-md: var(--shadow-medium);\n`;
  css += `  --shadow-lg: var(--shadow-hard);\n`;

  // Typography Tokens
  css += `\n  /* ==========================================================================
   * 5. TYPOGRAPHY SYSTEM
   * Font families, modular scale, weights, line heights, and letter spacings.
   * ========================================================================== */\n`;

  css += `  --font-family-primary: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n`;
  css += `  --font-family-sans: var(--font-family-primary);\n\n`;

  for (const typo of parsed.typography) {
    css += `  /* Typography Scale: ${typo.name} */\n`;
    css += `  --font-size-${typo.slug}: ${typo.fontSize};\n`;
    css += `  --line-height-${typo.slug}: ${typo.lineHeight};\n`;
    css += `  --font-weight-${typo.slug}: ${typo.fontWeight};\n`;
    css += `  --letter-spacing-${typo.slug}: ${typo.letterSpacing};\n`;
    css += `  --font-${typo.slug}: ${typo.fontWeight} ${typo.fontSize} / ${typo.lineHeight} var(--font-family-primary);\n\n`;
  }

  css += `}\n\n`;

  // -------------------------------------------------------------------------
  // Helper / Utility Classes for Rapid UI Construction
  // -------------------------------------------------------------------------
  css += `/* ==========================================================================
 * UTILITY CLASSES FOR UI IMPLEMENTATION
 * Ready-to-use classes aligned with the design tokens.
 * ========================================================================== */

/* --- Typography Utility Classes --- */\n`;

  for (const typo of parsed.typography) {
    css += `.text-${typo.slug} {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-${typo.slug});
  line-height: var(--line-height-${typo.slug});
  font-weight: var(--font-weight-${typo.slug});
  letter-spacing: var(--letter-spacing-${typo.slug});
}\n\n`;
  }

  css += `/* --- Surface & Elevation Utilities --- */
.surface {
  background-color: var(--color-surface);
  color: var(--color-on-surface);
}

.surface-container-low {
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface);
}

.surface-container-high {
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.surface-container-highest {
  background-color: var(--color-surface-container-highest);
  color: var(--color-on-surface);
}

.shadow-soft {
  box-shadow: var(--shadow-soft);
}

.shadow-medium {
  box-shadow: var(--shadow-medium);
}

.shadow-hard {
  box-shadow: var(--shadow-hard);
}

/* --- Interactive Element Examples (Color Roles in Action) --- */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-soft);
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 10px 20px;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-label-large);
  font-weight: var(--font-weight-label-large);
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn-primary:hover {
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 10px 20px;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-label-large);
  font-weight: var(--font-weight-label-large);
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.btn-secondary:hover {
  background-color: var(--color-secondary-container);
  color: var(--color-on-secondary-container);
}

.card-booking {
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  border: 1px solid var(--color-outline-variant);
  border-radius: 12px;
  box-shadow: var(--shadow-soft);
  padding: 24px;
}
`;

  return css;
}

/**
 * Main conversion runner.
 * @param {string} inputFilePath
 * @param {string} outputFilePath
 */
function convertTokens(inputFilePath, outputFilePath) {
  // Resolve input file
  let resolvedInput = inputFilePath;
  if (!resolvedInput) {
    for (const candidate of DEFAULT_INPUT_CANDIDATES) {
      if (fs.existsSync(candidate)) {
        resolvedInput = candidate;
        break;
      }
    }
  }

  if (!resolvedInput || !fs.existsSync(resolvedInput)) {
    console.error(`[Error] Design tokens input file not found!`);
    console.error(`Checked paths:\n${DEFAULT_INPUT_CANDIDATES.map(c => `  - ${c}`).join('\n')}`);
    process.exit(1);
  }

  const resolvedOutput = outputFilePath || DEFAULT_OUTPUT;

  console.log(`\n======================================================`);
  console.log(` Liz's Grillz Bookings: Design Tokens to CSS Converter`);
  console.log(`======================================================`);
  console.log(`[Input]  ${path.relative(process.cwd(), resolvedInput) || resolvedInput}`);
  console.log(`[Output] ${path.relative(process.cwd(), resolvedOutput) || resolvedOutput}`);

  // Read JSON
  const rawData = fs.readFileSync(resolvedInput, 'utf8');
  let tokensData;
  try {
    tokensData = JSON.parse(rawData);
  } catch (err) {
    console.error(`[Error] Failed to parse JSON tokens file: ${err.message}`);
    process.exit(1);
  }

  // Parse and build registry
  const parsed = buildTokenRegistry(tokensData);

  // Generate CSS
  const css = generateCSS(parsed, resolvedInput);

  // Ensure output directory exists
  const outDir = path.dirname(resolvedOutput);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(resolvedOutput, css, 'utf8');

  // Stats
  const keyColorCount = parsed.primitives.keyColors.length;
  const paletteCount = Object.keys(parsed.primitives.palettes).length;
  let paletteTokenCount = 0;
  for (const tokens of Object.values(parsed.primitives.palettes)) {
    paletteTokenCount += tokens.length;
  }
  const roleCount = parsed.roles.length;
  const effectCount = parsed.effects.length;
  const typoCount = parsed.typography.length;

  console.log(`\nConversion Summary:`);
  console.log(` - Primitives: ${keyColorCount} key colors, ${paletteCount} palettes (${paletteTokenCount} tones total)`);
  console.log(` - Color Roles: ${roleCount} UI semantic roles mapped to primitives`);
  console.log(` - Effects: ${effectCount} drop shadow definitions`);
  console.log(` - Typography: ${typoCount} font scale styles & utility classes`);
  console.log(`\n[Success] CSS variables written to: ${resolvedOutput}\n`);
}

// ---------------------------------------------------------------------------
// CLI Execution Handling
// ---------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);

  // Show Help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  node convert-tokens.js [options] [inputFile] [outputFile]

Options:
  -i, --input <path>     Path to design tokens JSON file
  -o, --output <path>    Path to output CSS file (default: tokens.css)
  -w, --watch            Watch input file for changes and recompile automatically
  -h, --help             Show this help message

Examples:
  node convert-tokens.js
  node convert-tokens.js "design-tokens.tokens (1).json" tokens.css
  node convert-tokens.js --watch
    `);
    process.exit(0);
  }

  let inputPath = null;
  let outputPath = null;
  let isWatch = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') {
      inputPath = args[++i];
    } else if (args[i] === '--output' || args[i] === '-o') {
      outputPath = args[++i];
    } else if (args[i] === '--watch' || args[i] === '-w') {
      isWatch = true;
    } else if (!args[i].startsWith('-')) {
      if (!inputPath) {
        inputPath = args[i];
      } else if (!outputPath) {
        outputPath = args[i];
      }
    }
  }

  // Initial Run
  convertTokens(inputPath, outputPath);

  // Watch Mode
  if (isWatch) {
    let resolvedInput = inputPath;
    if (!resolvedInput) {
      for (const candidate of DEFAULT_INPUT_CANDIDATES) {
        if (fs.existsSync(candidate)) {
          resolvedInput = candidate;
          break;
        }
      }
    }

    if (!resolvedInput) {
      console.error('[Error] Cannot watch: input file not found.');
      process.exit(1);
    }

    console.log(`[Watch Mode Active] Watching for changes to ${resolvedInput}...`);
    let debounceTimer = null;
    fs.watch(resolvedInput, (eventType) => {
      if (eventType === 'change') {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`\n[Watcher] Detected changes in tokens file. Recompiling...`);
          convertTokens(resolvedInput, outputPath);
        }, 100);
      }
    });
  }
}

// Allow both CLI usage and programmatic import
if (require.main === module) {
  main();
} else {
  module.exports = {
    convertTokens,
    buildTokenRegistry,
    generateCSS,
    normalizeColor,
    formatBoxShadow,
    toKebabCase
  };
}
