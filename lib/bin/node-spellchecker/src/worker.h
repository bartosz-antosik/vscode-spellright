#ifndef WORKER_H
#define WORKER_H

#include "nan.h"
#include "spellchecker.h"

#include <vector>

using namespace spellchecker;
using namespace v8;

class CheckSpellingWorker : public Nan::AsyncWorker {
public:
  CheckSpellingWorker(std::vector<uint16_t> &&corpus, SpellcheckerImplementation* impl, Nan::Callback* callback);
  ~CheckSpellingWorker();

  void Execute();
  void HandleOKCallback();
private:
  const std::vector<uint16_t> corpus;
  SpellcheckerImplementation* impl;
  std::vector<MisspelledRange> misspelled_ranges;
};

#endif
