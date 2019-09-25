#ifndef SRC_SPELLCHECKER_WIN_H_
#define SRC_SPELLCHECKER_WIN_H_

#define _WINSOCKAPI_

#include <spellcheck.h>
#include <uv.h>

#include "spellchecker.h"

namespace spellchecker {

class WindowsSpellchecker;

class WindowsSpellcheckerThreadView : public SpellcheckerThreadView {
public:
  WindowsSpellcheckerThreadView(WindowsSpellchecker *impl, DWORD spellcheckerCookie);
  ~WindowsSpellcheckerThreadView() override;

  std::vector<MisspelledRange> CheckSpelling(const uint16_t *text, size_t length) override;

private:
  HRESULT initResult;
  ISpellChecker* spellchecker;
};

class WindowsSpellchecker : public SpellcheckerImplementation {
public:
  bool IsSupported();

  WindowsSpellchecker();
  ~WindowsSpellchecker();

  bool SetDictionary(const std::string& language, const std::string& path);
  std::vector<std::string> GetAvailableDictionaries(const std::string& path);

  std::vector<std::string> GetCorrectionsForMisspelling(const std::string& word);
  bool IsMisspelled(const std::string& word);
  std::vector<MisspelledRange> CheckSpelling(const uint16_t *text, size_t length);
  void Add(const std::string& word);
  void Remove(const std::string& word);

  std::unique_ptr<SpellcheckerThreadView> CreateThreadView();
  uv_mutex_t &GetGlobalTableMutex();

private:
  uv_mutex_t gTableMutex;
  bool gTableMutexOk;
  IGlobalInterfaceTable* gTable;
  DWORD currentSpellcheckerCookie;

  ISpellChecker* currentSpellchecker;
  ISpellCheckerFactory* spellcheckerFactory;
};

}  // namespace spellchecker

#endif  // SRC_SPELLCHECKER_MAC_H_
