#include <vector>
#include <utility>
#include "nan.h"
#include "spellchecker.h"
#include "worker.h"

using Nan::ObjectWrap;
using namespace spellchecker;
using namespace v8;

namespace {

class Spellchecker : public Nan::ObjectWrap {
  SpellcheckerImplementation* impl;

  static NAN_METHOD(New) {
    Nan::HandleScope scope;
    Spellchecker* that = new Spellchecker();
    that->Wrap(info.This());

    info.GetReturnValue().Set(info.This());
  }

  static NAN_METHOD(SetDictionary) {
    Nan::HandleScope scope;

    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    std::string language = *String::Utf8Value(info[0]);
    std::string directory = ".";
    if (info.Length() > 1) {
      directory = *String::Utf8Value(info[1]);
    }

    bool result = that->impl->SetDictionary(language, directory);
    info.GetReturnValue().Set(Nan::New(result));
  }

  static NAN_METHOD(IsMisspelled) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());
    std::string word = *String::Utf8Value(info[0]);

    info.GetReturnValue().Set(Nan::New(that->impl->IsMisspelled(word)));
  }

  static NAN_METHOD(CheckSpelling) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Handle<String> string = Handle<String>::Cast(info[0]);
    if (!string->IsString()) {
      return Nan::ThrowError("Bad argument");
    }

    Local<Array> result = Nan::New<Array>();
    info.GetReturnValue().Set(result);

    if (string->Length() == 0) {
      return;
    }

    std::vector<uint16_t> text(string->Length() + 1);
    string->Write(reinterpret_cast<uint16_t *>(text.data()));

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());
    std::vector<MisspelledRange> misspelled_ranges = that->impl->CheckSpelling(text.data(), text.size());

    std::vector<MisspelledRange>::const_iterator iter = misspelled_ranges.begin();
    for (; iter != misspelled_ranges.end(); ++iter) {
      size_t index = iter - misspelled_ranges.begin();
      uint32_t start = iter->start, end = iter->end;

      Local<Object> misspelled_range = Nan::New<Object>();
      misspelled_range->Set(Nan::New("start").ToLocalChecked(), Nan::New<Integer>(start));
      misspelled_range->Set(Nan::New("end").ToLocalChecked(), Nan::New<Integer>(end));
      result->Set(index, misspelled_range);
    }
  }

  static NAN_METHOD(CheckSpellingAsync) {
    Nan::HandleScope scope;
    if (info.Length() < 2) {
      return Nan::ThrowError("Bad argument");
    }

    Handle<String> string = Handle<String>::Cast(info[0]);
    if (!string->IsString()) {
      return Nan::ThrowError("Bad argument");
    }

    Nan::Callback *callback = new Nan::Callback(info[1].As<Function>());

    std::vector<uint16_t> corpus(string->Length() + 1);
    string->Write(reinterpret_cast<uint16_t *>(corpus.data()));

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    CheckSpellingWorker* worker = new CheckSpellingWorker(std::move(corpus), that->impl, callback);
    Nan::AsyncQueueWorker(worker);
  }

  static NAN_METHOD(Add) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());
    std::string word = *String::Utf8Value(info[0]);

    that->impl->Add(word);
    return;
  }

  static NAN_METHOD(Remove) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());
    std::string word = *String::Utf8Value(info[0]);

    that->impl->Remove(word);
    return;
  }


  static NAN_METHOD(GetAvailableDictionaries) {
    Nan::HandleScope scope;

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    std::string path = ".";
    if (info.Length() > 0) {
      std::string path = *String::Utf8Value(info[0]);
    }

    std::vector<std::string> dictionaries =
      that->impl->GetAvailableDictionaries(path);

    Local<Array> result = Nan::New<Array>(dictionaries.size());
    for (size_t i = 0; i < dictionaries.size(); ++i) {
      const std::string& dict = dictionaries[i];
      result->Set(i, Nan::New(dict.data(), dict.size()).ToLocalChecked());
    }

    info.GetReturnValue().Set(result);
  }

  static NAN_METHOD(GetCorrectionsForMisspelling) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    std::string word = *String::Utf8Value(info[0]);
    std::vector<std::string> corrections =
      that->impl->GetCorrectionsForMisspelling(word);

    Local<Array> result = Nan::New<Array>(corrections.size());
    for (size_t i = 0; i < corrections.size(); ++i) {
      const std::string& word = corrections[i];

      Nan::MaybeLocal<String> val = Nan::New<String>(word.data(), word.size());
      result->Set(i, val.ToLocalChecked());
    }

    info.GetReturnValue().Set(result);
  }

  Spellchecker() {
    impl = SpellcheckerFactory::CreateSpellchecker();
  }

  // actual destructor
  virtual ~Spellchecker() {
    delete impl;
  }

 public:
  static void Init(Handle<Object> exports) {
    Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(Spellchecker::New);

    tpl->SetClassName(Nan::New<String>("Spellchecker").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "setDictionary", Spellchecker::SetDictionary);
    Nan::SetPrototypeMethod(tpl, "getAvailableDictionaries", Spellchecker::GetAvailableDictionaries);
    Nan::SetPrototypeMethod(tpl, "getCorrectionsForMisspelling", Spellchecker::GetCorrectionsForMisspelling);
    Nan::SetPrototypeMethod(tpl, "isMisspelled", Spellchecker::IsMisspelled);
    Nan::SetPrototypeMethod(tpl, "checkSpelling", Spellchecker::CheckSpelling);
    Nan::SetPrototypeMethod(tpl, "checkSpellingAsync", Spellchecker::CheckSpellingAsync);
    Nan::SetPrototypeMethod(tpl, "add", Spellchecker::Add);
    Nan::SetPrototypeMethod(tpl, "remove", Spellchecker::Remove);

    exports->Set(Nan::New("Spellchecker").ToLocalChecked(), tpl->GetFunction());
  }
};

void Init(Handle<Object> exports, Handle<Object> module) {
  Spellchecker::Init(exports);
}

}  // namespace

NODE_MODULE(spellchecker, Init)
