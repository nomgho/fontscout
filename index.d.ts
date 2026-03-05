export interface FontDescriptor {
  readonly path: string;
  readonly postscriptName: string;
  readonly family: string;
  readonly style: string;
  readonly weight: number;
  readonly width: number;
  readonly italic: boolean;
  readonly monospace: boolean;
}

export interface QueryFontDescriptor {
  path?: string;
  postscriptName?: string;
  family?: string;
  style?: string;
  weight?: number;
  width?: number;
  italic?: boolean;
  monospace?: boolean;
}

/**
 * Asynchronously returns all font descriptors available on the system.
 */
export function getAvailableFonts(): Promise<FontDescriptor[]>;

/**
 * Synchronously returns all font descriptors available on the system.
 */
export function getAvailableFontsSync(): FontDescriptor[];

/**
 * Asynchronously returns all font descriptors on the system matching the
 * given query descriptor.
 */
export function findFonts(fontDescriptor: QueryFontDescriptor): Promise<FontDescriptor[]>;

/**
 * Synchronously returns all font descriptors on the system matching the
 * given query descriptor.
 */
export function findFontsSync(fontDescriptor: QueryFontDescriptor): FontDescriptor[];

/**
 * Asynchronously returns the single best matching font descriptor for the
 * given query. Always returns a result — may not exactly match the query if
 * not all parameters could be satisfied.
 */
export function findFont(fontDescriptor: QueryFontDescriptor): Promise<FontDescriptor>;

/**
 * Synchronously returns the single best matching font descriptor for the
 * given query. Always returns a result — may not exactly match the query if
 * not all parameters could be satisfied.
 */
export function findFontSync(fontDescriptor: QueryFontDescriptor): FontDescriptor;

/**
 * Asynchronously finds a font that supports the characters in `text`,
 * using the traits of the font identified by `postscriptName` as a guide.
 * If the original font already contains the characters, it is returned as-is.
 */
export function substituteFont(postscriptName: string, text: string): Promise<FontDescriptor>;

/**
 * Synchronously finds a font that supports the characters in `text`,
 * using the traits of the font identified by `postscriptName` as a guide.
 * If the original font already contains the characters, it is returned as-is.
 */
export function substituteFontSync(postscriptName: string, text: string): FontDescriptor;
