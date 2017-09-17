#include <cstdio>
#include <cwctype>
#include <algorithm>
#include "../vendor/hunspell/src/hunspell/hunspell.hxx"
#include "spellchecker_hunspell.h"

namespace spellchecker {

HunspellSpellchecker::HunspellSpellchecker() : hunspell(NULL), transcoder(NewTranscoder()) { }

HunspellSpellchecker::~HunspellSpellchecker() {
  if (hunspell) {
    delete hunspell;
  }

  if (transcoder) {
    FreeTranscoder(transcoder);
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

  hunspell = new Hunspell(affixpath.c_str(), dpath.c_str());
  return true;
}

std::vector<std::string> HunspellSpellchecker::GetAvailableDictionaries(const std::string& path) {
  return std::vector<std::string>();
}

bool HunspellSpellchecker::IsMisspelled(const std::string& word) {
  if (!hunspell) {
    return false;
  }
  return hunspell->spell(word.c_str()) == 0;
}

std::vector<MisspelledRange> HunspellSpellchecker::CheckSpelling(const uint16_t *utf16_text, size_t utf16_length) {
  std::vector<MisspelledRange> result;

  if (!hunspell || !transcoder) {
    return result;
  }

  std::vector<char> utf8_buffer(256);

  enum {
    unknown,
    in_separator,
    in_word,
  } state = in_separator;

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
            if (hunspell->spell(utf8_buffer.data()) == 0) {
              MisspelledRange range;
              range.start = word_start;
              range.end = i;
              result.push_back(range);
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
    char** slist;
    int size = hunspell->suggest(&slist, word.c_str());

    corrections.reserve(size);
    for (int i = 0; i < size; ++i) {
      corrections.push_back(slist[i]);
    }

    hunspell->free_list(&slist, size);
  }
  return corrections;
}

}  // namespace spellchecker
