#include "worker.h"

#include "nan.h"
#include "spellchecker.h"

#include <string>
#include <vector>
#include <utility>

CheckSpellingWorker::CheckSpellingWorker(
  std::vector<uint16_t>&& corpus,
  SpellcheckerImplementation* impl,
  Nan::Callback* callback
) : AsyncWorker(callback), corpus(std::move(corpus)), impl(impl)
{
  // No-op
}

CheckSpellingWorker::~CheckSpellingWorker()
{
  // No-op
}

void CheckSpellingWorker::Execute() {
  std::unique_ptr<SpellcheckerThreadView> view = impl->CreateThreadView();
  misspelled_ranges = view->CheckSpelling(corpus.data(), corpus.size());
}

void CheckSpellingWorker::HandleOKCallback() {
  Nan::HandleScope scope;

  v8::Local<v8::Context> context = Nan::GetCurrentContext();
  Local<Array> result = Nan::New<Array>();
  for (auto iter = misspelled_ranges.begin(); iter != misspelled_ranges.end(); ++iter) {
    size_t index = iter - misspelled_ranges.begin();
    uint32_t start = iter->start, end = iter->end;

    Local<Object> misspelled_range = Nan::New<Object>();
    misspelled_range->Set(context, Nan::New("start").ToLocalChecked(), Nan::New<Integer>(start));
    misspelled_range->Set(context, Nan::New("end").ToLocalChecked(), Nan::New<Integer>(end));
    result->Set(context, index, misspelled_range);
  }

  Local<Value> argv[] = { Nan::Null(), result };
  callback->Call(2, argv);
}
