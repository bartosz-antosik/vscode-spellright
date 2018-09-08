// -----------------------------------------------------------------------------
// File contains code taken from SpellChecker Node Module of NODE.js. It
// has been modified to work with various binary bindings without the need
// to rebuild them on target machine.
//
// SpellChecker Node Module: https://github.com/atom/node-spellchecker
// -----------------------------------------------------------------------------

'use strict';

const path = require('path');
const glob = require('glob');
const promise = require('any-promise');

var bindings = null;
var Spellchecker = null;

const loadBinary = function (baseName) {
  const nodeFiles = glob(path.join(__dirname, `bin/${baseName}*${process.arch}*.node`), { sync: true });

  var binding = null;

  nodeFiles.forEach((file) => {
    try {
      if (binding == null) {
        binding = require(file);
        if (SPELLRIGHT_DEBUG_OUTPUT) {
          console.log('[spellright] Bindings: \"' + path.basename(file) + '\".');
        }
      }
    } catch (e) {
    }
  });

  if (SPELLRIGHT_DEBUG_OUTPUT && !binding) {
    console.log('[spellright] Found no bindings among these files:');
    nodeFiles.forEach((file) => {
      console.log(file);
    });
  }

  return binding;
};

bindings = loadBinary('spellchecker');
Spellchecker = bindings.Spellchecker;

var defaultSpellcheck = null;
var cacheSpellcheck = [];

var ensureDefaultSpellCheck = function() {
  if (!defaultSpellcheck) {
    throw "[spellright] Spell checker not initialized properly. ";
  }
};

// This method has to be always called first (with the exception of
// getAvailableDictionaries).
var setDictionary = function(lang, dictPath) {
  if (!cacheSpellcheck[lang]) {
    cacheSpellcheck[lang] = new Spellchecker();
    cacheSpellcheck[lang].setDictionary(lang, dictPath);
  }
  defaultSpellcheck = cacheSpellcheck[lang];
  return defaultSpellcheck;
};

var isMisspelled = function() {
  ensureDefaultSpellCheck();

  return defaultSpellcheck.isMisspelled.apply(defaultSpellcheck, arguments);
};

var checkSpelling = function() {
  ensureDefaultSpellCheck();

  return defaultSpellcheck.checkSpelling.apply(defaultSpellcheck, arguments);
};

var add = function() {
  ensureDefaultSpellCheck();

  defaultSpellcheck.add.apply(defaultSpellcheck, arguments);
};

var remove = function() {
  ensureDefaultSpellCheck();

  defaultSpellcheck.remove.apply(defaultSpellcheck, arguments);
};

var getCorrectionsForMisspelling = function() {
  ensureDefaultSpellCheck();

  return defaultSpellcheck.getCorrectionsForMisspelling.apply(defaultSpellcheck, arguments);
};

var getAvailableDictionaries = function() {
  var spellcheck = undefined;
  if (!defaultSpellcheck) {
    spellcheck = new Spellchecker();
  } else {
    spellcheck = defaultSpellcheck;
  }
  return spellcheck.getAvailableDictionaries.apply(spellcheck, arguments);
};

var getDictionaryPath = function() {
  var dict = path.join(__dirname, '..', 'vendor', 'hunspell_dictionaries');
  try {
    // HACK: Special case being in an asar archive
    var unpacked = dict.replace('.asar' + path.sep, '.asar.unpacked' + path.sep);
    if (require('fs').statSyncNoException(unpacked)) {
      dict = unpacked;
    }
  } catch (error) {
  }
  return dict;
}

module.exports = {
  setDictionary: setDictionary,
  add: add,
  remove: remove,
  isMisspelled: isMisspelled,
  checkSpelling: checkSpelling,
  getAvailableDictionaries: getAvailableDictionaries,
  getCorrectionsForMisspelling: getCorrectionsForMisspelling,
  Spellchecker: Spellchecker
};
