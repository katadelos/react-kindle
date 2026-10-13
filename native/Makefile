.DEFAULT_GOAL := all

FLOAT_ABI ?= softfp
STRING_ABI ?= 0
CROSS_COMPILE ?=

ifeq ($(filter $(FLOAT_ABI),softfp hard),)
$(error FLOAT_ABI must be softfp or hard)
endif
ifeq ($(filter $(STRING_ABI),0 1),)
$(error STRING_ABI must be 0 or 1)
endif

.PHONY: all clean

clean:
	rm -rf build

ifneq ($(filter-out clean,$(or $(MAKECMDGOALS),all)),)
ifeq ($(strip $(CROSS_COMPILE)),)
$(error Set CROSS_COMPILE to the target toolchain prefix, including the trailing hyphen)
endif
endif

NATIVE_CXX = $(CROSS_COMPILE)g++
# Keep each ABI's objects separate.
OUTPUT_DIR = build/$(FLOAT_ABI)/abi$(STRING_ABI)
LIBRARY = $(OUTPUT_DIR)/libReactKindleChrome.so
OBJECT = $(OUTPUT_DIR)/chrome_module.o
ABI_FLAGS = -D_GLIBCXX_USE_CXX11_ABI=$(STRING_ABI) -march=armv7-a -mthumb -mfpu=neon -mfloat-abi=$(FLOAT_ABI)
CXXFLAGS ?= -O2

all: $(LIBRARY)

$(LIBRARY): $(OBJECT) react-kindle-native.exports.map Makefile
	$(NATIVE_CXX) $(ABI_FLAGS) $(LDFLAGS) -shared -Wl,--version-script=react-kindle-native.exports.map -Wl,-soname,libReactKindleChrome.so -o $@ $(OBJECT) -ldl -pthread $(LDLIBS)

$(OBJECT): chrome_module.cpp Makefile | $(OUTPUT_DIR)
	$(NATIVE_CXX) $(CPPFLAGS) $(CXXFLAGS) $(ABI_FLAGS) -std=c++14 -fPIC -fno-rtti -fvisibility=hidden -pthread -I. -MMD -MP -c $< -o $@

$(OUTPUT_DIR):
	mkdir -p $@

-include $(OBJECT:.o=.d)
