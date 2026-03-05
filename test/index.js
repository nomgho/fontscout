'use strict';

const fontManager = require('../');
const assert = require('assert');

// standard fonts likely to be installed on the CI platform
const standardFont = process.platform === 'linux' ? 'Liberation Sans' : 'Arial';
const postscriptName = process.platform === 'linux' ? 'LiberationSans' : 'ArialMT';

function assertFontDescriptor(font) {
  assert.equal(typeof font, 'object');
  assert.equal(typeof font.path, 'string');
  assert.equal(typeof font.postscriptName, 'string');
  assert.equal(typeof font.family, 'string');
  assert.equal(typeof font.style, 'string');
  assert.equal(typeof font.weight, 'number');
  assert.equal(typeof font.width, 'number');
  assert.equal(typeof font.italic, 'boolean');
  assert.equal(typeof font.monospace, 'boolean');
}

describe('fontscout', function() {
  it('should export the expected functions', function() {
    assert.equal(typeof fontManager.getAvailableFonts, 'function');
    assert.equal(typeof fontManager.getAvailableFontsSync, 'function');
    assert.equal(typeof fontManager.findFonts, 'function');
    assert.equal(typeof fontManager.findFontsSync, 'function');
    assert.equal(typeof fontManager.findFont, 'function');
    assert.equal(typeof fontManager.findFontSync, 'function');
    assert.equal(typeof fontManager.substituteFont, 'function');
    assert.equal(typeof fontManager.substituteFontSync, 'function');
  });

  describe('getAvailableFonts', function() {
    this.timeout(30000);

    it('should return a Promise', function() {
      const result = fontManager.getAvailableFonts();
      assert(result instanceof Promise);
      return result;
    });

    it('should return an array of font descriptors', async function() {
      const fonts = await fontManager.getAvailableFonts();
      assert(Array.isArray(fonts));
      assert(fonts.length > 0);
      fonts.forEach(assertFontDescriptor);
    });
  });

  describe('getAvailableFontsSync', function() {
    it('should return an array of font descriptors synchronously', function() {
      const fonts = fontManager.getAvailableFontsSync();
      assert(Array.isArray(fonts));
      assert(fonts.length > 0);
      fonts.forEach(assertFontDescriptor);
    });
  });

  describe('findFonts', function() {
    it('should throw if no font descriptor is provided', async function() {
      await assert.rejects(() => fontManager.findFonts(), /Expected a font descriptor/);
    });

    it('should throw if font descriptor is not an object', async function() {
      await assert.rejects(() => fontManager.findFonts(2), /Expected a font descriptor/);
    });

    it('should return an array of matching font descriptors', async function() {
      const fonts = await fontManager.findFonts({ family: standardFont });
      assert(Array.isArray(fonts));
      assert(fonts.length > 0);
      fonts.forEach(assertFontDescriptor);
    });

    it('should find fonts by postscriptName', async function() {
      const fonts = await fontManager.findFonts({ postscriptName });
      assert(Array.isArray(fonts));
      assert.equal(fonts.length, 1);
      assert.equal(fonts[0].postscriptName, postscriptName);
      assert.equal(fonts[0].family, standardFont);
    });

    it('should find fonts by family and style', async function() {
      const fonts = await fontManager.findFonts({ family: standardFont, style: 'Bold' });
      assert(Array.isArray(fonts));
      assert.equal(fonts.length, 1);
      assert.equal(fonts[0].family, standardFont);
      assert.equal(fonts[0].style, 'Bold');
      assert.equal(fonts[0].weight, 700);
    });

    it('should find fonts by weight', async function() {
      const fonts = await fontManager.findFonts({ family: standardFont, weight: 700 });
      assert(Array.isArray(fonts));
      assert(fonts.length > 0);
      fonts.forEach(font => assert.equal(font.weight, 700));
    });

    it('should find italic fonts', async function() {
      const fonts = await fontManager.findFonts({ family: standardFont, italic: true });
      assert(Array.isArray(fonts));
      assert(fonts.length > 0);
      fonts.forEach(font => assert.equal(font.italic, true));
    });

    it('should find italic and bold fonts', async function() {
      const fonts = await fontManager.findFonts({ family: standardFont, italic: true, weight: 700 });
      assert(Array.isArray(fonts));
      assert(fonts.length > 0);
      fonts.forEach(font => {
        assert.equal(font.italic, true);
        assert.equal(font.weight, 700);
      });
    });

    it('should return an empty array for a nonexistent family', async function() {
      const fonts = await fontManager.findFonts({ family: '' + Date.now() });
      assert(Array.isArray(fonts));
      assert.equal(fonts.length, 0);
    });

    it('should return an empty array for a nonexistent postscriptName', async function() {
      const fonts = await fontManager.findFonts({ postscriptName: '' + Date.now() });
      assert(Array.isArray(fonts));
      assert.equal(fonts.length, 0);
    });

    it('should return many fonts for an empty font descriptor', async function() {
      const fonts = await fontManager.findFonts({});
      assert(Array.isArray(fonts));
      assert(fonts.length > 0);
      fonts.forEach(assertFontDescriptor);
    });
  });

  describe('findFontsSync', function() {
    it('should throw if no font descriptor is provided', function() {
      assert.throws(() => fontManager.findFontsSync(), /Expected a font descriptor/);
    });

    it('should throw if font descriptor is not an object', function() {
      assert.throws(() => fontManager.findFontsSync(2), /Expected a font descriptor/);
    });

    it('should find fonts synchronously', function() {
      const fonts = fontManager.findFontsSync({ family: standardFont });
      assert(Array.isArray(fonts));
      assert(fonts.length > 0);
      fonts.forEach(assertFontDescriptor);
    });

    it('should find fonts by postscriptName', function() {
      const fonts = fontManager.findFontsSync({ postscriptName });
      assert(Array.isArray(fonts));
      assert.equal(fonts.length, 1);
      assert.equal(fonts[0].postscriptName, postscriptName);
    });

    it('should find fonts by family and style', function() {
      const fonts = fontManager.findFontsSync({ family: standardFont, style: 'Bold' });
      assert.equal(fonts[0].style, 'Bold');
      assert.equal(fonts[0].weight, 700);
    });

    it('should return an empty array for a nonexistent family', function() {
      const fonts = fontManager.findFontsSync({ family: '' + Date.now() });
      assert.equal(fonts.length, 0);
    });
  });

  describe('findFont', function() {
    it('should throw if no font descriptor is provided', async function() {
      await assert.rejects(() => fontManager.findFont(), /Expected a font descriptor/);
    });

    it('should throw if font descriptor is not an object', async function() {
      await assert.rejects(() => fontManager.findFont(2), /Expected a font descriptor/);
    });

    it('should return a single font descriptor', async function() {
      const font = await fontManager.findFont({ family: standardFont });
      assert.equal(typeof font, 'object');
      assert(!Array.isArray(font));
      assertFontDescriptor(font);
      assert.equal(font.family, standardFont);
    });

    it('should find font by postscriptName', async function() {
      const font = await fontManager.findFont({ postscriptName });
      assertFontDescriptor(font);
      assert.equal(font.postscriptName, postscriptName);
    });

    it('should find font by family and style', async function() {
      const font = await fontManager.findFont({ family: standardFont, style: 'Bold' });
      assertFontDescriptor(font);
      assert.equal(font.style, 'Bold');
      assert.equal(font.weight, 700);
    });

    it('should return a fallback font for a nonexistent family', async function() {
      const font = await fontManager.findFont({ family: '' + Date.now() });
      assertFontDescriptor(font);
    });

    it('should return a fallback font matching traits as best as possible', async function() {
      const font = await fontManager.findFont({ family: '' + Date.now(), weight: 700 });
      assertFontDescriptor(font);
      assert.equal(font.weight, 700);
    });
  });

  describe('findFontSync', function() {
    it('should throw if no font descriptor is provided', function() {
      assert.throws(() => fontManager.findFontSync(), /Expected a font descriptor/);
    });

    it('should throw if font descriptor is not an object', function() {
      assert.throws(() => fontManager.findFontSync(2), /Expected a font descriptor/);
    });

    it('should return a single font synchronously', function() {
      const font = fontManager.findFontSync({ family: standardFont });
      assert.equal(typeof font, 'object');
      assert(!Array.isArray(font));
      assertFontDescriptor(font);
    });

    it('should return a fallback font for a nonexistent family', function() {
      const font = fontManager.findFontSync({ family: '' + Date.now() });
      assertFontDescriptor(font);
    });
  });

  describe('substituteFont', function() {
    it('should throw if no postscript name is provided', async function() {
      await assert.rejects(() => fontManager.substituteFont(), /Expected postscript name/);
    });

    it('should throw if postscript name is not a string', async function() {
      await assert.rejects(() => fontManager.substituteFont(2, 'hi'), /Expected postscript name/);
    });

    it('should throw if no substitution string is provided', async function() {
      await assert.rejects(() => fontManager.substituteFont(postscriptName), /Expected substitution string/);
    });

    it('should return a substitute font asynchronously', async function() {
      const font = await fontManager.substituteFont(postscriptName, '汉字');
      assert.equal(typeof font, 'object');
      assert(!Array.isArray(font));
      assertFontDescriptor(font);
      assert.notEqual(font.postscriptName, postscriptName);
    });

    it('should return the same font if it already contains the requested characters', async function() {
      const font = await fontManager.substituteFont(postscriptName, 'hi');
      assertFontDescriptor(font);
      assert.equal(font.postscriptName, postscriptName);
    });

    it('should return a default font if no font exists for the given postscriptName', async function() {
      const font = await fontManager.substituteFont('' + Date.now(), '汉字');
      assertFontDescriptor(font);
    });
  });

  describe('substituteFontSync', function() {
    it('should throw if no postscript name is provided', function() {
      assert.throws(() => fontManager.substituteFontSync(), /Expected postscript name/);
    });

    it('should throw if postscript name is not a string', function() {
      assert.throws(() => fontManager.substituteFontSync(2, 'hi'), /Expected postscript name/);
    });

    it('should substitute font synchronously', function() {
      const font = fontManager.substituteFontSync(postscriptName, '汉字');
      assertFontDescriptor(font);
      assert.notEqual(font.postscriptName, postscriptName);
    });

    it('should return the same font if it already contains the requested characters', function() {
      const font = fontManager.substituteFontSync(postscriptName, 'hi');
      assertFontDescriptor(font);
      assert.equal(font.postscriptName, postscriptName);
    });
  });
});
