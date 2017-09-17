#ifndef SRC_SPELLCHECKER_MAC_H_
#define SRC_SPELLCHECKER_MAC_H_

#include "spellchecker.h"

#import <Cocoa/Cocoa.h>
#import <dispatch/dispatch.h>

namespace spellchecker {

class MacSpellchecker : public SpellcheckerImplementation {
public:
  MacSpellchecker();
  ~MacSpellchecker();

  bool SetDictionary(const std::string& language, const std::string& path);
  std::vector<std::string> GetAvailableDictionaries(const std::string& path);
  std::vector<std::string> GetCorrectionsForMisspelling(const std::string& word);
  bool IsMisspelled(const std::string& word);
  std::vector<MisspelledRange> CheckSpelling(const uint16_t *text, size_t length);
  void Add(const std::string& word);
  void Remove(const std::string& word);
  
private:
  NSSpellChecker* spellChecker;
  NSString* spellCheckerLanguage;

  void UpdateGlobalSpellchecker();
};

}  // namespace spellchecker

#endif  // SRC_SPELLCHECKER_MAC_H_
