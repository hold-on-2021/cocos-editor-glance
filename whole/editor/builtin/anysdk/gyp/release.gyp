{
  "targets": [
    {
      "target_name": "binding",
      "sources": [
        "src/binding.cc",
        "src/utils.cc",
        "src/py_object_wrapper.cc",
        "src/AnyDeclare.h",
        "src/AnyEncrypt.h",
        "src/AnyEncrypt.cpp",
        "src/base64.h",
        "src/base64.cpp",
        "src/MD5.cpp",
        "src/MD5.h"
      ],
      "conditions": [
        ['OS=="mac"', {
          "xcode_settings": {
            "OTHER_CFLAGS": [
              "-Wno-error=unused-command-line-argument",
              "<!(/usr/bin/python-config --cflags)"
            ],
            "OTHER_LDFLAGS": [
              "<!(/usr/bin/python-config --ldflags)"
            ]
          }
        }, {
          "include_dirs": [
            "{{PYTHON_INCLUDE}}"
          ],
          "link_settings": {
            "libraries": [
              "{{PYTHON_python27.lib}}",
              "<(nodedir)/<(target_arch)/iojs.lib"
            ]
          }
        }]
      ]
    }
  ]
}
