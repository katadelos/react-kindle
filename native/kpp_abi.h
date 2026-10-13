#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

namespace utils {
namespace json {

class ImplDetails;

// Recovered from the Kindle 5.16.2.1.1 libJsonContainer ABI.
class JsonContainer {
 public:
  JsonContainer();
  JsonContainer(const JsonContainer& other);
  JsonContainer(JsonContainer&& other);
  explicit JsonContainer(const std::string& json);
  virtual ~JsonContainer();

  template <typename T>
  static JsonContainer createJsonValue(T value);
  std::string contentToJson();
  template <typename T> std::vector<T> getValuesToVector();

 private:
  std::shared_ptr<ImplDetails> details_;
};

template <>
JsonContainer JsonContainer::createJsonValue<std::string>(std::string value);

}  // namespace json
}  // namespace utils

namespace reactNative {
namespace nativeModule {

namespace constant {
class ConstantAggregator;
}

namespace method {

class CallJSInterface;
class MethodAggregator;

// The firmware owns construction/destruction of the interface portion. A
// method type of 2 is a synchronous React Native method on this KPP build.
class MethodContainerInterface {
 public:
  explicit MethodContainerInterface(const std::string& name);
  virtual ~MethodContainerInterface();
  virtual utils::json::JsonContainer invoke(
      utils::json::JsonContainer&& arguments) = 0;

 protected:
  int methodType_;
  std::string methodName_;
};

}  // namespace method

// Vtable-shape shim, not an exact source reconstruction. The stock interface
// owns 13 slots; this header declares the first eight here and the remaining
// five on NativeModule so the supported NativeModule-derived path has the
// working final order. Never derive directly from NativeModuleInterface.
class NativeModuleInterface {
 public:
  NativeModuleInterface();

  virtual void callJSModule(const std::string& module,
                            const std::string& method,
                            utils::json::JsonContainer&& arguments);
  virtual ~NativeModuleInterface() = default;
  void sendJSEvent(const std::string& name, bool value);
  void sendJSEvent(const std::string& name,
                   utils::json::JsonContainer&& value);
  virtual void shutdown();
  virtual void invokeJSCallback(long long callbackId,
                                utils::json::JsonContainer&& arguments);
  virtual std::string getName() const = 0;
  virtual void aggregateMethods(method::MethodAggregator& methods) = 0;
  virtual void aggregateConstants(
      constant::ConstantAggregator& constants) = 0;

 protected:
  method::CallJSInterface* callJSInterface_;
};

class NativeModule : public NativeModuleInterface {
 public:
  using MethodDescriptor = std::pair<std::string, std::string>;
  using MethodDescriptors = std::vector<MethodDescriptor>;

  NativeModule();
  ~NativeModule() override;

  // The 5.16 implementation returns a 12-byte vector through the ARM hidden
  // structure-return argument and fills it with 8-byte name/type pairs. This
  // declaration preserves that ABI shape. Plug-ins should not call or
  // override it until the element semantics are qualified end to end,
  // including the larger strings used by ABI1 firmware.
  // The stock return type has no C++11 ABI tag. Bind its exported spelling
  // explicitly: our vector-of-pairs layout declaration contains std::string.
  virtual MethodDescriptors getMethodDescriptors() const
      asm("_ZNK11reactNative12nativeModule12NativeModule20getMethodDescriptorsEv");
  virtual utils::json::JsonContainer triggerAggregateConstants();
  virtual void triggerAggregateMethods();
  virtual utils::json::JsonContainer invoke(
      long long methodId,
      utils::json::JsonContainer&& arguments,
      long long callId);
  virtual void onShutdown();

 protected:
  std::vector<std::unique_ptr<method::MethodContainerInterface>> methods_;
  utils::json::JsonContainer constants_;
};

namespace method {

// The launcher creates this object around a NativeModule while collecting its
// methods. Only the owned-method vector is needed by this plug-in.
class MethodAggregator {
 public:
  void add(std::unique_ptr<MethodContainerInterface> method) {
    methods_.push_back(std::move(method));
  }

 private:
  std::vector<std::unique_ptr<MethodContainerInterface>> methods_;
  NativeModuleInterface* owner_;
  NativeModuleInterface* adjustedOwner_;
};

}  // namespace method
}  // namespace nativeModule
}  // namespace reactNative

#if __SIZEOF_POINTER__ == 4
static_assert(sizeof(utils::json::JsonContainer) == 12,
              "Unexpected JsonContainer layout");
static_assert(
    sizeof(reactNative::nativeModule::method::MethodContainerInterface) == 8 + sizeof(std::string),
    "Unexpected MethodContainerInterface layout");
static_assert(sizeof(reactNative::nativeModule::NativeModuleInterface) == 8,
              "Unexpected NativeModuleInterface layout");
static_assert(sizeof(reactNative::nativeModule::NativeModule) == 32,
              "Unexpected NativeModule layout");
static_assert(
    sizeof(reactNative::nativeModule::NativeModule::MethodDescriptor) == 2 * sizeof(std::string),
    "Unexpected method descriptor element layout");
static_assert(
    sizeof(reactNative::nativeModule::NativeModule::MethodDescriptors) == 12,
    "Unexpected method descriptor vector layout");
static_assert(sizeof(reactNative::nativeModule::method::MethodAggregator) == 20,
              "Unexpected MethodAggregator layout");
#endif
