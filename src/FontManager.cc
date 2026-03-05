#include <napi.h>
#include "FontDescriptor.h"

// these functions are implemented by the platform
ResultSet *getAvailableFonts();
ResultSet *findFonts(FontDescriptor *);
FontDescriptor *findFont(FontDescriptor *);
FontDescriptor *substituteFont(char *, char *);

// ---------------------------------------------------------------------------
// AsyncWorker subclasses — one per operation
// ---------------------------------------------------------------------------

class GetAvailableFontsWorker : public Napi::AsyncWorker {
public:
  GetAvailableFontsWorker(Napi::Function callback)
    : Napi::AsyncWorker(callback), results(nullptr) {}

  ~GetAvailableFontsWorker() {
    if (results) delete results;
  }

  void Execute() override {
    results = getAvailableFonts();
  }

  void OnOK() override {
    Napi::Env env = Env();
    Napi::Array res = Napi::Array::New(env, results->size());
    int i = 0;
    for (auto it = results->begin(); it != results->end(); ++it) {
      res.Set(i++, (*it)->toJSObject(env));
    }
    delete results;
    results = nullptr;
    Callback().Call({res});
  }

private:
  ResultSet *results;
};

class FindFontsWorker : public Napi::AsyncWorker {
public:
  FindFontsWorker(Napi::Function callback, FontDescriptor *desc)
    : Napi::AsyncWorker(callback), desc(desc), results(nullptr) {}

  ~FindFontsWorker() {
    if (desc) delete desc;
    if (results) delete results;
  }

  void Execute() override {
    results = findFonts(desc);
  }

  void OnOK() override {
    Napi::Env env = Env();
    Napi::Array res = Napi::Array::New(env, results->size());
    int i = 0;
    for (auto it = results->begin(); it != results->end(); ++it) {
      res.Set(i++, (*it)->toJSObject(env));
    }
    delete results;
    results = nullptr;
    Callback().Call({res});
  }

private:
  FontDescriptor *desc;
  ResultSet *results;
};

class FindFontWorker : public Napi::AsyncWorker {
public:
  FindFontWorker(Napi::Function callback, FontDescriptor *desc)
    : Napi::AsyncWorker(callback), desc(desc), result(nullptr) {}

  ~FindFontWorker() {
    if (desc) delete desc;
    if (result) delete result;
  }

  void Execute() override {
    result = findFont(desc);
  }

  void OnOK() override {
    Napi::Env env = Env();
    Napi::Value res = result ? result->toJSObject(env).As<Napi::Value>() : env.Null();
    delete result;
    result = nullptr;
    Callback().Call({res});
  }

private:
  FontDescriptor *desc;
  FontDescriptor *result;
};

class SubstituteFontWorker : public Napi::AsyncWorker {
public:
  SubstituteFontWorker(Napi::Function callback, std::string postscriptName, std::string substitutionString)
    : Napi::AsyncWorker(callback),
      postscriptName(postscriptName),
      substitutionString(substitutionString),
      result(nullptr) {}

  ~SubstituteFontWorker() {
    if (result) delete result;
  }

  void Execute() override {
    result = substituteFont(
      const_cast<char *>(postscriptName.c_str()),
      const_cast<char *>(substitutionString.c_str())
    );
  }

  void OnOK() override {
    Napi::Env env = Env();
    Napi::Value res = result ? result->toJSObject(env).As<Napi::Value>() : env.Null();
    delete result;
    result = nullptr;
    Callback().Call({res});
  }

private:
  std::string postscriptName;
  std::string substitutionString;
  FontDescriptor *result;
};

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

Napi::Value GetAvailableFontsAsync(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsFunction())
    throw Napi::TypeError::New(env, "Expected a callback");

  auto *worker = new GetAvailableFontsWorker(info[0].As<Napi::Function>());
  worker->Queue();
  return env.Undefined();
}

Napi::Value GetAvailableFontsSync(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  ResultSet *results = getAvailableFonts();
  Napi::Array res = Napi::Array::New(env, results->size());
  int i = 0;
  for (auto it = results->begin(); it != results->end(); ++it) {
    res.Set(i++, (*it)->toJSObject(env));
  }
  delete results;
  return res;
}

Napi::Value FindFontsAsync(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsObject() || info[0].IsFunction())
    throw Napi::TypeError::New(env, "Expected a font descriptor");
  if (info.Length() < 2 || !info[1].IsFunction())
    throw Napi::TypeError::New(env, "Expected a callback");

  auto *desc = new FontDescriptor(info[0].As<Napi::Object>());
  auto *worker = new FindFontsWorker(info[1].As<Napi::Function>(), desc);
  worker->Queue();
  return env.Undefined();
}

Napi::Value FindFontsSync(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsObject() || info[0].IsFunction())
    throw Napi::TypeError::New(env, "Expected a font descriptor");

  FontDescriptor *desc = new FontDescriptor(info[0].As<Napi::Object>());
  ResultSet *results = findFonts(desc);
  delete desc;

  Napi::Array res = Napi::Array::New(env, results->size());
  int i = 0;
  for (auto it = results->begin(); it != results->end(); ++it) {
    res.Set(i++, (*it)->toJSObject(env));
  }
  delete results;
  return res;
}

Napi::Value FindFontAsync(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsObject() || info[0].IsFunction())
    throw Napi::TypeError::New(env, "Expected a font descriptor");
  if (info.Length() < 2 || !info[1].IsFunction())
    throw Napi::TypeError::New(env, "Expected a callback");

  auto *desc = new FontDescriptor(info[0].As<Napi::Object>());
  auto *worker = new FindFontWorker(info[1].As<Napi::Function>(), desc);
  worker->Queue();
  return env.Undefined();
}

Napi::Value FindFontSync(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsObject() || info[0].IsFunction())
    throw Napi::TypeError::New(env, "Expected a font descriptor");

  FontDescriptor *desc = new FontDescriptor(info[0].As<Napi::Object>());
  FontDescriptor *result = findFont(desc);
  delete desc;

  if (!result) return env.Null();
  Napi::Object res = result->toJSObject(env);
  delete result;
  return res;
}

Napi::Value SubstituteFontAsync(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsString())
    throw Napi::TypeError::New(env, "Expected postscript name");
  if (info.Length() < 2 || !info[1].IsString())
    throw Napi::TypeError::New(env, "Expected substitution string");
  if (info.Length() < 3 || !info[2].IsFunction())
    throw Napi::TypeError::New(env, "Expected a callback");

  std::string ps = info[0].As<Napi::String>().Utf8Value();
  std::string sub = info[1].As<Napi::String>().Utf8Value();
  auto *worker = new SubstituteFontWorker(info[2].As<Napi::Function>(), ps, sub);
  worker->Queue();
  return env.Undefined();
}

Napi::Value SubstituteFontSync(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsString())
    throw Napi::TypeError::New(env, "Expected postscript name");
  if (info.Length() < 2 || !info[1].IsString())
    throw Napi::TypeError::New(env, "Expected substitution string");

  std::string ps = info[0].As<Napi::String>().Utf8Value();
  std::string sub = info[1].As<Napi::String>().Utf8Value();

  FontDescriptor *result = substituteFont(
    const_cast<char *>(ps.c_str()),
    const_cast<char *>(sub.c_str())
  );

  if (!result) return env.Null();
  Napi::Object res = result->toJSObject(env);
  delete result;
  return res;
}

// ---------------------------------------------------------------------------
// Module init
// ---------------------------------------------------------------------------

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("getAvailableFonts",     Napi::Function::New(env, GetAvailableFontsAsync));
  exports.Set("getAvailableFontsSync", Napi::Function::New(env, GetAvailableFontsSync));
  exports.Set("findFonts",             Napi::Function::New(env, FindFontsAsync));
  exports.Set("findFontsSync",         Napi::Function::New(env, FindFontsSync));
  exports.Set("findFont",              Napi::Function::New(env, FindFontAsync));
  exports.Set("findFontSync",          Napi::Function::New(env, FindFontSync));
  exports.Set("substituteFont",        Napi::Function::New(env, SubstituteFontAsync));
  exports.Set("substituteFontSync",    Napi::Function::New(env, SubstituteFontSync));
  return exports;
}

NODE_API_MODULE(fontmanager, Init)
