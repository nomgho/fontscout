{
  "targets": [
    {
      "target_name": "fontmanager",
      "sources": [ "src/FontManager.cc" ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include_dir\")"
      ],
      "defines": [ "NAPI_CPP_EXCEPTIONS" ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "conditions": [
        ['OS=="mac"', {
          "sources": ["src/FontManagerMac.mm"],
          "link_settings": {
            "libraries": ["CoreText.framework", "Foundation.framework"]
          },
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
          }
        }],
        ['OS=="win"', {
          "sources": ["src/FontManagerWindows.cc"],
          "link_settings": {
            "libraries": ["Dwrite.lib"]
          },
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1
            }
          }
        }],
        ['OS=="linux"', {
          "sources": ["src/FontManagerLinux.cc"],
          "link_settings": {
            "libraries": ["-lfontconfig"]
          }
        }]
      ]
    }
  ]
}
