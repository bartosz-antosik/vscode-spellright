#include <cstdio>
#include <cwctype>
#include <clocale>
#include <algorithm>
#include "../vendor/hunspell/src/hunspell/hunspell.hxx"
#include "spellchecker_hunspell.h"
#include "buffers.h"

namespace spellchecker {

HunspellSpellchecker::HunspellSpellchecker() : hunspell(NULL), transcoder(NewUTF16ToUTF8Transcoder()), toDictionaryTranscoder(NULL), fromDictionaryTranscoder(NULL) { }

HunspellSpellchecker::~HunspellSpellchecker() {
  if (hunspell) {
    delete hunspell;
  }

  if (transcoder) {
    FreeTranscoder(transcoder);
  }

  if (toDictionaryTranscoder) {
    FreeTranscoder(toDictionaryTranscoder);
  }

  if (fromDictionaryTranscoder) {
    FreeTranscoder(fromDictionaryTranscoder);
  }
}

bool HunspellSpellchecker::SetDictionary(const std::string& language, const std::string& dirname) {
  if (hunspell) {
    delete hunspell;
    hunspell = NULL;
  }

  // NB: Hunspell uses underscore to separate language and locale, and Win8 uses
  // dash - if they use the wrong one, just silently replace it for them
  std::string lang = language;
  std::replace(lang.begin(), lang.end(), '-', '_');

  std::string affixpath = dirname + "/" + lang + ".aff";
  std::string dpath = dirname + "/" + lang + ".dic";

  // TODO: This code is almost certainly jacked on Win32 for non-ASCII paths
  FILE* handle = fopen(dpath.c_str(), "r");
  if (!handle) {
    return false;
  }
  fclose(handle);

  // Create the hunspell object with our dictionary.
  hunspell = new Hunspell(affixpath.c_str(), dpath.c_str());

  // Once we have the dictionary, then we check to see if we need
  // an internal conversion. This is needed because Hunspell has
  // two modes: in UTF-8 mode, everything is treated as a UTF-8
  // string which is what we have. Otherwise, it needs the specific
  // encoding of the file.
  std::string encoding = hunspell->get_dic_encoding();
  bool isUTF8 = encoding.compare("UTF-8") == 0;

  if (toDictionaryTranscoder) {
    FreeTranscoder(toDictionaryTranscoder);
    toDictionaryTranscoder = NULL;
  }

  if (fromDictionaryTranscoder) {
    FreeTranscoder(fromDictionaryTranscoder);
    fromDictionaryTranscoder = NULL;
  }

  if (!isUTF8) {
    toDictionaryTranscoder = NewTranscoder8to8("UTF8", encoding.c_str());
    fromDictionaryTranscoder = NewTranscoder8to8(encoding.c_str(), "UTF8");
  }

  // Return that we successfully created the components.
  return true;
}

std::vector<std::string> HunspellSpellchecker::GetAvailableDictionaries(const std::string& path) {
  return std::vector<std::string>();
}

bool HunspellSpellchecker::IsMisspelled(const std::string& word) {
  if (!hunspell) {
    return false;
  }

  // If the word is too long, then don't do anything.
  if (word.length() > MAX_UTF8_BUFFER) {
    return false;
  }

  // If we have a dictionary transcoder, then we need to transcode
  // the input into the encoding the dictionary requires.
  std::vector<char> dict_buffer(MAX_TRANSCODE_BUFFER);
  bool converted = Transcode8to8(toDictionaryTranscoder, dict_buffer.data(), dict_buffer.size(), word.data(), word.size());

  if (!converted) {
    return false;
  }

  // Process the call on the transcoded data.
  return hunspell->spell(dict_buffer.data()) == 0;
}

std::vector<MisspelledRange> HunspellSpellchecker::CheckSpelling(const uint16_t *utf16_text, size_t utf16_length) {
  std::vector<MisspelledRange> result;

  if (!hunspell || !transcoder) {
    return result;
  }

  std::vector<char> utf8_buffer(MAX_UTF16_TO_UTF8_BUFFER);

  enum {
    unknown,
    in_separator,
    in_word,
  } state = in_separator;

  // Because all of the strings are UTF-8 because we got them from Chrome that
  // way, we need to make sure our iswalpha works on UTF-8 strings. We picked a
  // generic locale because we don't pass the locale in. Sadly, "C.utf8" doesn't
  // work so we assume that US English is available everywhere.
  setlocale(LC_CTYPE, "en_US.UTF-8");

  // Go through the UTF-16 characters and look for breaks.
  for (size_t word_start = 0, i = 0; i < utf16_length; i++) {
    uint16_t c = utf16_text[i];

    switch (state) {
      case unknown:
        if (iswpunct(c) || iswspace(c)) {
          state = in_separator;
        }
        break;

      case in_separator:
        if (iswalpha(c)) {
          word_start = i;
          state = in_word;
        } else if (!iswpunct(c) && !iswspace(c)) {
          state = unknown;
        }
        break;

      case in_word:
        if (c == '\'' && iswalpha(utf16_text[i + 1])) {
          i++;
        } else if (c == 0 || iswpunct(c) || iswspace(c)) {
          state = in_separator;
          bool converted = TranscodeUTF16ToUTF8(transcoder, (char *)utf8_buffer.data(), utf8_buffer.size(), utf16_text + word_start, i - word_start);

          if (converted) {
            // Convert the buffer into a dictionary-specific encoding.
            std::vector<char> dict_buffer(MAX_TRANSCODE_BUFFER);
            converted = Transcode8to8(toDictionaryTranscoder, dict_buffer.data(), dict_buffer.size(), utf8_buffer.data(), utf8_buffer.size());

            if (converted) {
              // Pass in the dictionary-encoded text for spelling.
              if (hunspell->spell(dict_buffer.data()) == 0) {
                MisspelledRange range;
                range.start = word_start;
                range.end = i;
                result.push_back(range);
              }
            }
          }
        } else if (!iswalpha(c)) {
          state = unknown;
        }
        break;
    }
  }

  return result;
}

void HunspellSpellchecker::Add(const std::string& word) {
  if (hunspell) {
    hunspell->add(word.c_str());
  }
}

void HunspellSpellchecker::Remove(const std::string& word) {
  if (hunspell) {
    hunspell->remove(word.c_str());
  }
}

std::vector<std::string> HunspellSpellchecker::GetCorrectionsForMisspelling(const std::string& word) {
  std::vector<std::string> corrections;

  if (hunspell) {
    // Convert the buffer into a dictionary-specific encoding.
    std::vector<char> dict_buffer(MAX_TRANSCODE_BUFFER);
    bool converted = Transcode8to8(toDictionaryTranscoder, dict_buffer.data(), dict_buffer.size(), word.data(), word.size());

    if (converted) {
      // Get the suggested on the dictionary-encoded word.
      char** slist;
      int size = hunspell->suggest(&slist, dict_buffer.data());

      corrections.reserve(size);

      for (int i = 0; i < size; ++i) {
        // The items in the `slist` are still in dictionary encoding. We need to
        // convert them back to UTF-8 so Chrome/V8 can play with them properly.
        std::string word = slist[i];
        bool converted = Transcode8to8(fromDictionaryTranscoder, dict_buffer.data(), dict_buffer.size(), word.data(), word.size());

        if (converted) {
          // Put this one back in encoded format.
          corrections.push_back(dict_buffer.data());
        } else {
          // If we couldn't convert, we need to put the poorly encoded one so
          // they can see it.
          corrections.push_back(slist[i]);
        }
      }

      hunspell->free_list(&slist, size);
    }
  }

  return corrections;
}

}  // namespace spellchecker
