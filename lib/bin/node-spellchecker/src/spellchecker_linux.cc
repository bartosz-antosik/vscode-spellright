#include "spellchecker.h"
#include "spellchecker_hunspell.h"

namespace spellchecker {

SpellcheckerImplementation* SpellcheckerFactory::CreateSpellchecker(int spellcheckerType) {
  return new HunspellSpellchecker();
}

}  // namespace spellchecker
