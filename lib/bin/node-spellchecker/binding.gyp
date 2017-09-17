{
  'variables': {
    'conditions': [
      ['OS=="mac"', {
        'spellchecker_use_hunspell%': 'true',
      }],
      ['OS=="linux"', {
        'spellchecker_use_hunspell': 'true',
      }],
      ['OS=="win"', {
        'spellchecker_use_hunspell': 'true',
      }],
    ],
  },
  'target_defaults': {
    'cflags_cc': ['-std=c++11'],
    'conditions': [
      ['OS=="win"', {
        'msvs_disabled_warnings': [
          4267,  # conversion from 'size_t' to 'int', possible loss of data
          4530,  # C++ exception handler used, but unwind semantics are not enabled
          4506,  # no definition for inline function
        ],
      }],
      ['OS=="mac"', {
        'xcode_settings': {
           'CLANG_CXX_LIBRARY': 'libc++',
           'CLANG_CXX_LANGUAGE_STANDARD': 'c++11'
        }
      }]
    ],
  },
  'targets': [
    {
      'target_name': 'spellchecker',
      'include_dirs': [ '<!(node -e "require(\'nan\')")' ],
      'sources': [
        'src/main.cc',
        'src/worker.cc'
      ],
      'conditions': [
        ['spellchecker_use_hunspell=="true"', {
          'dependencies': [
            'hunspell',
          ],
          'sources': [
            'src/spellchecker_hunspell.cc',
          ],
        }],
        ['OS=="win"', {
          'sources': [
             'src/spellchecker_win.cc',
             'src/transcoder_win.cc',
          ],
        }],
        ['OS=="linux"', {
          'sources': [
             'src/spellchecker_linux.cc',
             'src/transcoder_posix.cc',
          ],
        }],
        ['OS=="mac"', {
          'sources': [
            'src/spellchecker_mac.mm',
            'src/transcoder_posix.cc',
          ],
          'link_settings': {
            'libraries': [
              '$(SDKROOT)/System/Library/Frameworks/AppKit.framework',
            ],
          },
        }],
      ],
    },
  ],
  'conditions': [
    ['spellchecker_use_hunspell=="true"', {
      'targets': [
        {
          'target_name': 'hunspell',
          'type': 'static_library',
          'msvs_guid': 'D5E8DCB2-9C61-446F-8BEE-B18CA0E0936E',
          'defines': [
            'HUNSPELL_STATIC',
          ],
          'sources': [
            'vendor/hunspell/src/hunspell/affentry.cxx',
            'vendor/hunspell/src/hunspell/affentry.hxx',
            'vendor/hunspell/src/hunspell/affixmgr.cxx',
            'vendor/hunspell/src/hunspell/affixmgr.hxx',
            'vendor/hunspell/src/hunspell/atypes.hxx',
            'vendor/hunspell/src/hunspell/baseaffix.hxx',
            'vendor/hunspell/src/hunspell/csutil.cxx',
            'vendor/hunspell/src/hunspell/csutil.hxx',
            'vendor/hunspell/src/hunspell/dictmgr.cxx',
            'vendor/hunspell/src/hunspell/dictmgr.hxx',
            'vendor/hunspell/src/hunspell/filemgr.cxx',
            'vendor/hunspell/src/hunspell/filemgr.hxx',
            'vendor/hunspell/src/hunspell/hashmgr.cxx',
            'vendor/hunspell/src/hunspell/hashmgr.hxx',
            'vendor/hunspell/src/hunspell/htypes.hxx',
            'vendor/hunspell/src/hunspell/hunspell.cxx',
            'vendor/hunspell/src/hunspell/hunspell.h',
            'vendor/hunspell/src/hunspell/hunspell.hxx',
            'vendor/hunspell/src/hunspell/hunzip.cxx',
            'vendor/hunspell/src/hunspell/hunzip.hxx',
            'vendor/hunspell/src/hunspell/langnum.hxx',
            'vendor/hunspell/src/hunspell/phonet.cxx',
            'vendor/hunspell/src/hunspell/phonet.hxx',
            'vendor/hunspell/src/hunspell/replist.cxx',
            'vendor/hunspell/src/hunspell/replist.hxx',
            'vendor/hunspell/src/hunspell/suggestmgr.cxx',
            'vendor/hunspell/src/hunspell/suggestmgr.hxx',
            'vendor/hunspell/src/hunspell/utf_info.hxx',
            'vendor/hunspell/src/hunspell/w_char.hxx',
            'vendor/hunspell/src/parsers/textparser.cxx',
            'vendor/hunspell/src/parsers/textparser.hxx',
          ],
          'direct_dependent_settings': {
            'defines': [
              'HUNSPELL_STATIC',
              'USE_HUNSPELL',
            ],
          },
        }
      ],
    }],
  ],
}
