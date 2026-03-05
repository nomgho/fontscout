# fontscout

[![CI](https://github.com/nomgho/fontscout/actions/workflows/ci.yml/badge.svg)](https://github.com/nomgho/fontscout/actions/workflows/ci.yml)

A fast native Node.js addon for querying the system font catalog. Returns full font metadata including PostScript name, family, style, weight, width, italic and monospace flags, and file path.

Works on **macOS**, **Windows**, and **Linux** using the native OS font APIs — no slow shell commands, no parsing.

> Based on the original [font-manager](https://github.com/devongovett/font-manager) by Devon Govett.
> Modernised for Node 18+ with node-addon-api (NAPI), Promise/async-await API, and ESM support.

## Platform support

| Platform | API used |
|---|---|
| macOS 10.13+ | [CoreText](https://developer.apple.com/documentation/coretext) |
| Windows 7+ | [DirectWrite](https://learn.microsoft.com/en-us/windows/win32/directwrite/direct-write-portal) |
| Linux | [Fontconfig](https://www.freedesktop.org/software/fontconfig/) |

## Requirements

- Node.js 18 or later
- A C++ build toolchain (for compiling the native addon on install):
  - macOS: Xcode Command Line Tools (`xcode-select --install`)
  - Windows: Visual Studio Build Tools with the "Desktop development with C++" workload
  - Linux: `build-essential` + `libfontconfig1-dev`

On Linux, install the font dependencies before running `npm install`:

```bash
sudo apt-get install build-essential libfontconfig1-dev
```

## Installation

```bash
npm install fontscout
```

## Usage

### CommonJS

```js
const { getAvailableFonts, findFont, findFonts, substituteFont } = require('fontscout');
```

### ESM

```js
import { getAvailableFonts, findFont, findFonts, substituteFont } from 'fontscout';
```

## API

All async functions return a **Promise**. Every function also has a synchronous `*Sync` variant.

### `getAvailableFonts()`

Returns all fonts installed on the system.

```js
const fonts = await getAvailableFonts();

console.log(fonts.length); // e.g. 676

console.log(fonts[0]);
// {
//   path: '/Library/Fonts/Arial.ttf',
//   postscriptName: 'ArialMT',
//   family: 'Arial',
//   style: 'Regular',
//   weight: 400,
//   width: 5,
//   italic: false,
//   monospace: false
// }

// Synchronous version
const fonts = getAvailableFontsSync();
```

### `findFonts(descriptor)`

Returns an array of all fonts matching the given query. Returns an empty array if none match.

```js
const fonts = await findFonts({ family: 'Arial' });
// [ { postscriptName: 'ArialMT', ... }, { postscriptName: 'Arial-BoldMT', ... }, ... ]

const boldFonts = await findFonts({ family: 'Arial', weight: 700 });

const italicFonts = await findFonts({ family: 'Arial', italic: true });

// Synchronous version
const fonts = findFontsSync({ family: 'Arial' });
```

### `findFont(descriptor)`

Returns the single best matching font for the given query. Always returns a result — never `null`. If no exact match exists, the closest available font is returned.

```js
const font = await findFont({ family: 'Arial', weight: 700 });
// {
//   path: '/Library/Fonts/Arial Bold.ttf',
//   postscriptName: 'Arial-BoldMT',
//   family: 'Arial',
//   style: 'Bold',
//   weight: 700,
//   width: 5,
//   italic: false,
//   monospace: false
// }

// Synchronous version
const font = findFontSync({ family: 'Arial', weight: 700 });
```

### `substituteFont(postscriptName, text)`

Finds a font that supports all the characters in `text`, using the traits of the font identified by `postscriptName` as a guide (bold, italic, etc.).

- If the original font already contains the characters, it is returned unchanged.
- If no font matches `postscriptName`, a suitable font for the characters is still returned.

```js
const font = await substituteFont('ArialMT', '汉字');
// {
//   path: '/Library/Fonts/Songti.ttc',
//   postscriptName: 'STSongti-SC-Regular',
//   family: 'Songti SC',
//   style: 'Regular',
//   weight: 400,
//   width: 5,
//   italic: false,
//   monospace: false
// }

// Synchronous version
const font = substituteFontSync('ArialMT', '汉字');
```

## Font descriptor

All query methods accept an object with any combination of these fields. All result objects always include all fields.

| Field | Type | Description |
|---|---|---|
| `path` | `string` | Absolute path to the font file. Results only — not used in queries. |
| `postscriptName` | `string` | PostScript name, e.g. `'Arial-BoldMT'`. Uniquely identifies a font. |
| `family` | `string` | Font family name, e.g. `'Arial'` |
| `style` | `string` | Style name, e.g. `'Bold'`, `'Italic'`, `'Regular'` |
| `weight` | `number` | Font weight — a multiple of 100 from 100 to 900 (see table below) |
| `width` | `number` | Font width — integer from 1 to 9 (see table below) |
| `italic` | `boolean` | Whether the font is italic |
| `monospace` | `boolean` | Whether the font is monospace |

### Weight values

| Value | Name |
|---|---|
| 100 | Thin |
| 200 | Ultra Light |
| 300 | Light |
| 400 | Normal |
| 500 | Medium |
| 600 | Semi Bold |
| 700 | Bold |
| 800 | Ultra Bold |
| 900 | Heavy |

### Width values

| Value | Name |
|---|---|
| 1 | Ultra Condensed |
| 2 | Extra Condensed |
| 3 | Condensed |
| 4 | Semi Condensed |
| 5 | Normal |
| 6 | Semi Expanded |
| 7 | Expanded |
| 8 | Extra Expanded |
| 9 | Ultra Expanded |

## License

MIT — see [LICENSE](LICENSE).

Original work copyright (c) 2014-2026 Devon Govett.
Modifications copyright (c) 2026-present nomgho.
