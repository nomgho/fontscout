'use strict';

const binding = require('node-gyp-build')(__dirname);

function promisify(fn, ...args) {
  return new Promise((resolve, reject) => {
    try {
      fn(...args, resolve);
    } catch (err) {
      reject(err);
    }
  });
}

exports.getAvailableFonts = () =>
  promisify(binding.getAvailableFonts.bind(binding));

exports.getAvailableFontsSync = () =>
  binding.getAvailableFontsSync();

exports.findFonts = (desc) =>
  promisify(binding.findFonts.bind(binding), desc);

exports.findFontsSync = (desc) =>
  binding.findFontsSync(desc);

exports.findFont = (desc) =>
  promisify(binding.findFont.bind(binding), desc);

exports.findFontSync = (desc) =>
  binding.findFontSync(desc);

exports.substituteFont = (postscriptName, text) =>
  promisify(binding.substituteFont.bind(binding), postscriptName, text);

exports.substituteFontSync = (postscriptName, text) =>
  binding.substituteFontSync(postscriptName, text);
