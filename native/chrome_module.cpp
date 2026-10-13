// LIPC chrome transport and application window geometry.
#include "kpp_abi.h"
#include <dlfcn.h>
#include <deque>
#include <mutex>
#include <stdexcept>
#include <cstdio>

extern "C" { __attribute__((visibility("hidden"))) char __libc_single_threaded = 0; }
// GCC 14 containers call a helper added after the device libstdc++ (3.4.28).
// Keep the same standard exception semantics without replacing the C++ runtime.
namespace std { __attribute__((noreturn))
void __throw_bad_array_new_length() { throw bad_array_new_length(); } }
namespace {
using Json = utils::json::JsonContainer;
using Callback = int (*)(void*, const char*, void*, void*);
void* lipcLibrary = nullptr;
void* connection = nullptr;
std::string identity;
std::mutex eventMutex;
std::deque<std::pair<std::string, std::string>> events;

template<class T> T symbol(const char* name) {
  auto value = reinterpret_cast<T>(dlsym(lipcLibrary, name));
  if (!value) throw std::runtime_error(std::string("Missing LIPC symbol: ") + name);
  return value;
}
int receive(void*, const char* property, void* value, void*) {
  std::lock_guard<std::mutex> lock(eventMutex);
  if (events.size() == 64) events.pop_front();
  events.emplace_back(property, static_cast<const char*>(value));
  return 0;
}
std::string viewport(const std::string& appId) {
  static void* xlib = dlopen("libX11.so.6", RTLD_NOW | RTLD_LOCAL);
  if (!xlib) return "null";
  auto open = reinterpret_cast<void*(*)(const char*)>(dlsym(xlib, "XOpenDisplay"));
  auto root = reinterpret_cast<unsigned long(*)(void*)>(dlsym(xlib, "XDefaultRootWindow"));
  auto tree = reinterpret_cast<int(*)(void*,unsigned long,unsigned long*,unsigned long*,unsigned long**,unsigned int*)>(dlsym(xlib,"XQueryTree"));
  auto name = reinterpret_cast<int(*)(void*,unsigned long,char**)>(dlsym(xlib,"XFetchName"));
  auto free = reinterpret_cast<int(*)(void*)>(dlsym(xlib,"XFree"));
  auto geometry = reinterpret_cast<int(*)(void*,unsigned long,unsigned long*,int*,int*,unsigned int*,unsigned int*,unsigned int*,unsigned int*)>(dlsym(xlib,"XGetGeometry"));
  if (!open || !root || !tree || !name || !free || !geometry) return "null";
  static void* display = open(nullptr);
  if (!display) return "null";
  static unsigned long appWindow = 0;
  unsigned long rootWindow, parent, *children = nullptr;
  unsigned int count = 0;
  if (!appWindow && tree(display, root(display), &rootWindow, &parent, &children, &count)) {
    for (unsigned int i = 0; i < count; ++i) {
      char* title = nullptr;
      if (name(display, children[i], &title) && title) {
        std::string text(title);
        if (text.find("L:A_") == 0 && text.find("_ID:" + appId + "_") != std::string::npos) appWindow = children[i];
        free(title);
      }
    }
    if (children) free(children);
  }
  int x, y;
  unsigned int width, height, border, depth;
  if (!appWindow || !geometry(display, appWindow, &rootWindow, &x, &y, &width, &height, &border, &depth)) return "null";
  return "{\"width\":" + std::to_string(width) + ",\"height\":" + std::to_string(height) + "}";
}
class ViewportMethod final : public reactNative::nativeModule::method::MethodContainerInterface {
 public:
  ViewportMethod() : MethodContainerInterface("getViewport") { methodType_ = 2; }
  Json invoke(Json&& args) override {
    auto values = args.getValuesToVector<std::string>();
    return Json::createJsonValue<std::string>(values.size() == 1 ? viewport(values[0]) : "null");
  }
};
class Method final : public reactNative::nativeModule::method::MethodContainerInterface {
  bool configure_;
 public:
  explicit Method(bool configure) : MethodContainerInterface(configure ? "configure" : "takeEvents"), configure_(configure) { methodType_ = 2; }
  Json invoke(Json&& args) override {
    try {
      if (!configure_) {
        std::lock_guard<std::mutex> lock(eventMutex);
        std::string result = "[";
        for (const auto& event : events) {
          if (result.size() > 1) result += ",";
          result += "{\"property\":" + Json::createJsonValue<std::string>(event.first).contentToJson()
            + ",\"id\":" + Json::createJsonValue<std::string>(event.second).contentToJson() + "}";
        }
        events.clear();
        return Json::createJsonValue<std::string>(result + "]");
      }
      auto values = args.getValuesToVector<std::string>();
      if (values.size() != 2 || values[0].empty() || values[1].size() > 65536)
        throw std::runtime_error("configure requires source and a bounded JSON configuration");
      if (!lipcLibrary) lipcLibrary = dlopen("liblipc.so.1", RTLD_NOW | RTLD_LOCAL);
      if (!lipcLibrary) throw std::runtime_error("liblipc is unavailable");
      if (connection && identity != values[0]) throw std::runtime_error("Chrome source cannot change in a running process");
      if (!connection) {
        connection = symbol<void*(*)(const char*)>("LipcOpen")(values[0].c_str());
        if (!connection) throw std::runtime_error("Cannot own chrome callback source");
        identity = values[0];
        auto reg = symbol<int(*)(void*,const char*,Callback,Callback,void*)>("LipcRegisterStringProperty");
        for (const char* property : {"invokeAction", "searchBarButtonSelected", "systemMenuItemSelected"}) {
          if (reg(connection, property, nullptr, receive, nullptr)) throw std::runtime_error("Cannot register chrome callback");
        }
      }
      int status = symbol<int(*)(void*,const char*,const char*,const char*)>("LipcSetStringProperty")(
        connection, "com.lab126.chromebar", "configureChrome", values[1].c_str());
      if (status) throw std::runtime_error("configureChrome failed: " + std::to_string(status));
      return Json::createJsonValue<std::string>("");
    } catch (const std::exception& error) {
      return Json::createJsonValue<std::string>(std::string("ERROR: ") + error.what());
    }
  }
};
class Module final : public reactNative::nativeModule::NativeModule {
 public:
  std::string getName() const override { return "ReactKindleChrome"; }
  void aggregateMethods(reactNative::nativeModule::method::MethodAggregator& methods) override {
    methods.add(std::unique_ptr<reactNative::nativeModule::method::MethodContainerInterface>(new ViewportMethod()));
    for (bool configure : {true, false}) methods.add(std::unique_ptr<reactNative::nativeModule::method::MethodContainerInterface>(new Method(configure)));
  }
  void aggregateConstants(reactNative::nativeModule::constant::ConstantAggregator&) override {}
  void onShutdown() override {
    if (connection) {
      symbol<void(*)(void*)>("LipcClose")(connection);
      connection = nullptr;
    }
  }
};
}
#define EXPORT extern "C" __attribute__((visibility("default")))
EXPORT void registerModules(void* modules, void*) {
  static_cast<std::vector<std::shared_ptr<reactNative::nativeModule::NativeModuleInterface>>*>(modules)->push_back(std::make_shared<Module>());
}
EXPORT void initModule() {}
EXPORT void registerReactNative(void*) {}
EXPORT void onLoadJavascript() {}
EXPORT void onRunJavascript() {}
