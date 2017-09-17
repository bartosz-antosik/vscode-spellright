#include <windows.h>
#include <stdlib.h>
#include "transcoder.h"

namespace spellchecker {

struct Transcoder {};

Transcoder* NewTranscoder() {
  return new Transcoder();
}

void FreeTranscoder(Transcoder *transcoder) {
  delete transcoder;
}

bool TranscodeUTF16ToUTF8(const Transcoder *transcoder, char *out, size_t out_length, const uint16_t *in, size_t in_length) {
  int length = WideCharToMultiByte(CP_UTF8, 0, reinterpret_cast<const wchar_t *>(in), in_length, out, out_length, NULL, NULL);
  out[length] = '\0';
  return true;
}

}  // namespace spellchecker
