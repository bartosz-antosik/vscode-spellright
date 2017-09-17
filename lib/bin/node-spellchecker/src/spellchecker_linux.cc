#include "spellchecker.h"
#include "spellchecker_hunspell.h"

namespace spellchecker {

SpellcheckerImplementation* SpellcheckerFactory::CreateSpellchecker() {
  return new HunspellSpellchecker();
}

}  // namespace spellchecker
