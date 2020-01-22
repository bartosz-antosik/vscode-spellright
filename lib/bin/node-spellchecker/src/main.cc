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

  static NAN_METHOD(SetSpellcheckerType) {
    // Pull out the handle to the spellchecker instance.
    Nan::HandleScope scope;

    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument: missing mode");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    // If we already have an implementation, then we want to complain because
    // we can't handle reinitializing the dictionary paths.
    if (that->impl) {
      return Nan::ThrowError("Cannot call SetSpellcheckerType after the dictionary has been configured or used");
    }

    // Make sure we have a sane value for our enumeration.
    int modeNumber = info[0]->Int32Value(Nan::GetCurrentContext()).ToChecked();
    int spellcheckerType = USE_SYSTEM_DEFAULTS;

    switch (modeNumber)
    {
      case 0:
        break;
      case 1:
        spellcheckerType = ALWAYS_USE_SYSTEM;
        break;
      case 2:
        spellcheckerType = ALWAYS_USE_HUNSPELL;
        break;
      default:
        return Nan::ThrowError("Bad argument: SetSpellcheckerType must be given 0, 1, or 2 as a parameter");
    }

    // Create a new one with the appropriate checker type.
    that->impl = SpellcheckerFactory::CreateSpellchecker(spellcheckerType);
  }

  static NAN_METHOD(SetDictionary) {
    Nan::HandleScope scope;

    if (info.Length() < 2) {
      return Nan::ThrowError("Bad arguments");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    std::string language = *Nan::Utf8String(info[0]);
    std::string directory = ".";
    if (info.Length() > 1) {
      directory = *Nan::Utf8String(info[1]);
    }

    // Make sure we have the implementation loaded.
    Spellchecker::EnsureLoadedImplementation(that);

    bool result = that->impl->SetDictionary(language, directory);
    info.GetReturnValue().Set(Nan::New(result));
  }

  static NAN_METHOD(IsMisspelled) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());
    std::string word = *Nan::Utf8String(info[0]);

    // Make sure we have the implementation loaded.
    Spellchecker::EnsureLoadedImplementation(that);

    info.GetReturnValue().Set(Nan::New(that->impl->IsMisspelled(word)));
  }

  static NAN_METHOD(CheckSpelling) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Local<String> string = Local<String>::Cast(info[0]);
    if (!string->IsString()) {
      return Nan::ThrowError("Bad argument");
    }

    Local<Array> result = Nan::New<Array>();
    info.GetReturnValue().Set(result);

    if (string->Length() == 0) {
      return;
    }

    std::vector<uint16_t> text(string->Length() + 1);
    string->Write(
#if V8_MAJOR_VERSION > 6
        info.GetIsolate(),
#endif
        reinterpret_cast<uint16_t *>(text.data()));

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    // Make sure we have the implementation loaded.
    Spellchecker::EnsureLoadedImplementation(that);

    std::vector<MisspelledRange> misspelled_ranges = that->impl->CheckSpelling(text.data(), text.size());

    std::vector<MisspelledRange>::const_iterator iter = misspelled_ranges.begin();
    for (; iter != misspelled_ranges.end(); ++iter) {
      size_t index = iter - misspelled_ranges.begin();
      uint32_t start = iter->start, end = iter->end;

      Local<Object> misspelled_range = Nan::New<Object>();

#ifdef V8_USE_MAYBE
      {
        Isolate* isolate = misspelled_range->GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        misspelled_range->Set(context, Nan::New("start").ToLocalChecked(), Nan::New<Integer>(start)).Check();
        misspelled_range->Set(context, Nan::New("end").ToLocalChecked(), Nan::New<Integer>(end)).Check();
      }
      Isolate* isolate = result->GetIsolate();
      Local<Context> context = isolate->GetCurrentContext();
      result->Set(context, index, misspelled_range).Check();
#else
      misspelled_range->Set(Nan::New("start").ToLocalChecked(), Nan::New<Integer>(start));
      misspelled_range->Set(Nan::New("end").ToLocalChecked(), Nan::New<Integer>(end));
      result->Set(index, misspelled_range);
#endif
    }
  }

  static NAN_METHOD(CheckSpellingAsync) {
    Nan::HandleScope scope;
    if (info.Length() < 2) {
      return Nan::ThrowError("Bad argument");
    }

    Local<String> string = Local<String>::Cast(info[0]);
    if (!string->IsString()) {
      return Nan::ThrowError("Bad argument");
    }

    Nan::Callback *callback = new Nan::Callback(info[1].As<Function>());

    std::vector<uint16_t> corpus(string->Length() + 1);
    string->Write(
#if V8_MAJOR_VERSION > 6
        info.GetIsolate(),
#endif
        reinterpret_cast<uint16_t *>(corpus.data()));

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    // Make sure we have the implementation loaded.
    Spellchecker::EnsureLoadedImplementation(that);

    CheckSpellingWorker* worker = new CheckSpellingWorker(std::move(corpus), that->impl, callback);
    Nan::AsyncQueueWorker(worker);
  }

  static NAN_METHOD(Add) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    // Make sure we have the implementation loaded.
    Spellchecker::EnsureLoadedImplementation(that);

    std::string word = *Nan::Utf8String(info[0]);
    that->impl->Add(word);
    return;
  }

  static NAN_METHOD(Remove) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    // Make sure we have the implementation loaded.
    Spellchecker::EnsureLoadedImplementation(that);

    std::string word = *Nan::Utf8String(info[0]);
    that->impl->Remove(word);
    return;
  }

  static NAN_METHOD(GetAvailableDictionaries) {
    Nan::HandleScope scope;

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    // Make sure we have the implementation loaded.
    Spellchecker::EnsureLoadedImplementation(that);

    std::string path = ".";
    if (info.Length() > 0) {
      std::string path = *Nan::Utf8String(info[0]);
    }

    std::vector<std::string> dictionaries =
      that->impl->GetAvailableDictionaries(path);

    Local<Array> result = Nan::New<Array>(dictionaries.size());
    for (size_t i = 0; i < dictionaries.size(); ++i) {
      const std::string& dict = dictionaries[i];
#ifdef V8_USE_MAYBE
      Isolate* isolate = result->GetIsolate();
      Local<Context> context = isolate->GetCurrentContext();
      result->Set(context, i, Nan::New(dict.data(), dict.size()).ToLocalChecked()).Check();
#else
      result->Set(i, Nan::New(dict.data(), dict.size()).ToLocalChecked());
#endif
    }

    info.GetReturnValue().Set(result);
  }

  static NAN_METHOD(GetCorrectionsForMisspelling) {
    Nan::HandleScope scope;
    if (info.Length() < 1) {
      return Nan::ThrowError("Bad argument");
    }

    Spellchecker* that = Nan::ObjectWrap::Unwrap<Spellchecker>(info.Holder());

    // Make sure we have the implementation loaded.
    Spellchecker::EnsureLoadedImplementation(that);

    std::string word = *Nan::Utf8String(info[0]);
    std::vector<std::string> corrections =
      that->impl->GetCorrectionsForMisspelling(word);

    Local<Array> result = Nan::New<Array>(corrections.size());
    for (size_t i = 0; i < corrections.size(); ++i) {
      const std::string& word = corrections[i];

      Nan::MaybeLocal<String> val = Nan::New<String>(word.data(), word.size());
#ifdef V8_USE_MAYBE
      Isolate* isolate = result->GetIsolate();
      Local<Context> context = isolate->GetCurrentContext();
      result->Set(context, i, val.ToLocalChecked()).Check();
#else
      result->Set(i, val.ToLocalChecked());
#endif
    }

    info.GetReturnValue().Set(result);
  }

  Spellchecker() {
    impl = NULL;
  }

  // actual destructor
  virtual ~Spellchecker() {
    delete impl;
  }

  static void EnsureLoadedImplementation(Spellchecker *that) {
    if (!that->impl) {
      that->impl = SpellcheckerFactory::CreateSpellchecker(USE_SYSTEM_DEFAULTS);
    }
  }

 public:
  static void Init(Local<Object> exports) {
    Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(Spellchecker::New);

    tpl->SetClassName(Nan::New<String>("Spellchecker").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "setSpellcheckerType", Spellchecker::SetSpellcheckerType);
    Nan::SetPrototypeMethod(tpl, "setDictionary", Spellchecker::SetDictionary);
    Nan::SetPrototypeMethod(tpl, "getAvailableDictionaries", Spellchecker::GetAvailableDictionaries);
    Nan::SetPrototypeMethod(tpl, "getCorrectionsForMisspelling", Spellchecker::GetCorrectionsForMisspelling);
    Nan::SetPrototypeMethod(tpl, "isMisspelled", Spellchecker::IsMisspelled);
    Nan::SetPrototypeMethod(tpl, "checkSpelling", Spellchecker::CheckSpelling);
    Nan::SetPrototypeMethod(tpl, "checkSpellingAsync", Spellchecker::CheckSpellingAsync);
    Nan::SetPrototypeMethod(tpl, "add", Spellchecker::Add);
    Nan::SetPrototypeMethod(tpl, "remove", Spellchecker::Remove);

    Isolate* isolate = exports->GetIsolate();
    Local<Context> context = isolate->GetCurrentContext();
#ifdef V8_USE_MAYBE
    exports->Set(context, Nan::New("Spellchecker").ToLocalChecked(), tpl->GetFunction(context).ToLocalChecked()).Check();
#else
    exports->Set(Nan::New("Spellchecker").ToLocalChecked(), tpl->GetFunction(context).ToLocalChecked());
#endif
  }
};

void Init(Local<Object> exports, Local<Object> module) {
  Spellchecker::Init(exports);
}

}  // namespace

NODE_MODULE(spellchecker, Init)
