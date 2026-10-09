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

var bindings = null;
var Spellchecker = null;

const loadBinary = function (baseName) {
      const nodeFiles = glob.globSync(`bin/${baseName}-${process.platform}*${process.arch}*.node`, {
    cwd: __dirname,
  });
  var binding = null;
  var loadErrors = [];

  nodeFiles.forEach((file) => {
    try {
      if (binding == null) {
        binding = require(path.join(__dirname, file));
        if (typeof global.SPELLRIGHT_DEBUG_OUTPUT !== 'undefined' && global.SPELLRIGHT_DEBUG_OUTPUT) {
          console.log('[spellright] Bindings: \"' + path.basename(file) + '\".');
        }
      }
    } catch (e) {
      loadErrors.push(path.basename(file) + ': ' + (e.message || e).toString().split('\n')[0]);
    }
  });

  if (typeof global.SPELLRIGHT_DEBUG_OUTPUT !== 'undefined' && global.SPELLRIGHT_DEBUG_OUTPUT && !binding) {
    console.log('[spellright] Found no bindings among these files:');
    nodeFiles.forEach((file) => {
      console.log(file);
    });
  }

  return {
    binding: binding,
    tried: nodeFiles.length ? nodeFiles.join(', ') : '(no matching bin/' + baseName + '-' + process.platform + '-*' + process.arch + '*.node files)',
    loadErrors: loadErrors
  };
};

// Pure-JavaScript fallback (hunspell-asm, WebAssembly build of Hunspell)
// used when no native binding loads, e.g. VS Code on a newer Electron
// than the shipped prebuilt binaries were compiled for. Implements the
// same Spellchecker surface. The WASM module initializes asynchronously
// (see `ready` export); all spell operations stay synchronous afterwards.
var _hunspellFactory = null;
var _hunspellFactoryError = null;
var _hunspellReady = null;
try {
  _hunspellReady = require('hunspell-asm').loadModule().then(
    function (factory) { _hunspellFactory = factory; return factory; },
    function (err) { _hunspellFactoryError = err; throw err; }
  );
  // Keep a handled branch so nothing warns when native bindings work
  // and nobody awaits the fallback init.
  _hunspellReady.then(null, function () {});
} catch (err) {
  _hunspellFactoryError = err;
  _hunspellReady = Promise.reject(err);
  _hunspellReady.then(null, function () {});
}

var JsSpellchecker = function () {
  this._hunspell = null;
  this._lang = '';
  this._affMount = null;
  this._dicMount = null;
};

JsSpellchecker.prototype._resolveDictFile = function (dictPath, lang, ext) {
  var fs = require('fs');
  var variants = [lang, lang.replace(/-/g, '_'), lang.replace(/_/g, '-')];
  var dirs = [];
  if (dictPath) dirs.push(dictPath);
  dirs.push('/usr/share/hunspell', '/usr/share/myspell');
  for (var d = 0; d < dirs.length; d++) {
    for (var v = 0; v < variants.length; v++) {
      var candidate = path.join(dirs[d], variants[v] + ext);
      try {
        if (fs.existsSync(candidate)) return candidate;
      } catch (e) { /* ignore */ }
    }
  }
  return null;
};

JsSpellchecker.prototype.setDictionary = function (lang, dictPath) {
  if (!_hunspellFactory) {
    if (_hunspellFactoryError) {
      var _msg = (_hunspellFactoryError && _hunspellFactoryError.message) ? _hunspellFactoryError.message : _hunspellFactoryError;
      throw new Error('[spellright] Spellchecker engine failed to initialize: ' + _msg);
    }
    throw new Error('[spellright] Spellchecker engine is still initializing, please try again in a moment.');
  }
  var fs = require('fs');
  var affFile = this._resolveDictFile(dictPath, lang, '.aff');
  var dicFile = this._resolveDictFile(dictPath, lang, '.dic');
  if (!affFile || !dicFile) {
    throw new Error('[spellright] No dictionary files found for "' + lang + '" (looked for ' + lang + '.aff/' + lang + '.dic in "' + dictPath + '", /usr/share/hunspell).');
  }
  if (this._hunspell) {
    try { this._hunspell.dispose(); } catch (e) { /* ignore */ }
    this._hunspell = null;
  }
  if (this._affMount) {
    try { _hunspellFactory.unmount(this._affMount); } catch (e) { /* ignore */ }
    this._affMount = null;
  }
  if (this._dicMount) {
    try { _hunspellFactory.unmount(this._dicMount); } catch (e) { /* ignore */ }
    this._dicMount = null;
  }
  this._affMount = _hunspellFactory.mountBuffer(fs.readFileSync(affFile), lang + '.aff');
  this._dicMount = _hunspellFactory.mountBuffer(fs.readFileSync(dicFile), lang + '.dic');
  this._hunspell = _hunspellFactory.create(this._affMount, this._dicMount);
  this._lang = lang;
  return true;
};

JsSpellchecker.prototype._ensureLoaded = function () {
  if (!this._hunspell) {
    throw '[spellright] Spell checker not initialized properly. ';
  }
};

JsSpellchecker.prototype.isMisspelled = function (word) {
  this._ensureLoaded();
  if (word === null || typeof word === 'undefined' || word === '') return false;
  return !this._hunspell.spell(word);
};

JsSpellchecker.prototype.checkSpelling = function (text) {
  this._ensureLoaded();
  var results = [];
  if (text === null || typeof text === 'undefined') return results;
  var re = /[^\s]+/g;
  var match = null;
  while ((match = re.exec(text)) !== null) {
    if (!this._hunspell.spell(match[0])) {
      results.push({ start: match.index, end: match.index + match[0].length });
    }
  }
  return results;
};

JsSpellchecker.prototype.add = function (word) {
  this._ensureLoaded();
  this._hunspell.addWord(word);
};

JsSpellchecker.prototype.remove = function (word) {
  this._ensureLoaded();
  this._hunspell.removeWord(word);
};

JsSpellchecker.prototype.getCorrectionsForMisspelling = function (word) {
  this._ensureLoaded();
  var suggestions = this._hunspell.suggest(word);
  return Array.isArray(suggestions) ? suggestions : [];
};

JsSpellchecker.prototype.getAvailableDictionaries = function () {
  // No native dictionary list in fallback mode; returning [] makes
  // SpellRight use hunspell-style dictionary files from disk.
  return [];
};

var _native = loadBinary('spellchecker');

var useNative = !!_native.binding;
var bindings = null;
var Spellchecker = null;

if (useNative) {
  bindings = _native.binding;
  Spellchecker = bindings.Spellchecker;
} else {
  console.log('[spellright] No native binding loaded (' + _native.loadErrors.join(' | ') +
    '). Using pure-JavaScript spellchecker fallback.');
  Spellchecker = JsSpellchecker;
}

var defaultSpellcheck = null;
var cacheSpellcheck = [];

var ensureDefaultSpellCheck = function() {
  if (!defaultSpellcheck) {
    throw "[spellright] Spell checker not initialized properly. ";
  }
};

// Fail-open guards for code paths outside the per-word loop (code actions,
// suggestions): with no usable dictionary there is nothing to flag, so
// assume correct / suggest nothing instead of throwing into the host log.
var hasDefaultSpellCheck = function() {
  return !!defaultSpellcheck;
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
  if (!hasDefaultSpellCheck()) return false;

  return defaultSpellcheck.isMisspelled.apply(defaultSpellcheck, arguments);
};

var checkSpelling = function() {
  if (!hasDefaultSpellCheck()) return [];

  return defaultSpellcheck.checkSpelling.apply(defaultSpellcheck, arguments);
};

var add = function() {
  if (!hasDefaultSpellCheck()) return;

  defaultSpellcheck.add.apply(defaultSpellcheck, arguments);
};

var remove = function() {
  if (!hasDefaultSpellCheck()) return;

  defaultSpellcheck.remove.apply(defaultSpellcheck, arguments);
};

var getCorrectionsForMisspelling = function() {
  if (!hasDefaultSpellCheck()) return [];

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
  Spellchecker: Spellchecker,
  // Resolves when the spellchecker engine is usable. Resolves
  // immediately with native bindings; waits for WASM init in fallback.
  ready: useNative ? Promise.resolve() : _hunspellReady
};
