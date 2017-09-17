#include <iconv.h>
#include <stdint.h>
#include <stdlib.h>

namespace spellchecker {

struct Transcoder {
  iconv_t conversion;
};

static int IsBigEndian(void) {
  union {
    uint16_t integer;
    char bytes[2];
  } two_byte_value;

  two_byte_value.integer = {0x0102};
  return two_byte_value.bytes[0] == 1;
}

Transcoder *NewTranscoder() {
  const char *to_encoding = "UTF-8";
  const char *from_encoding = IsBigEndian() ? "UTF-16BE" : "UTF-16LE";
  iconv_t conversion = iconv_open(to_encoding, from_encoding);
  if (conversion == (iconv_t)-1) {
    return NULL;
  }

  Transcoder *result = new Transcoder();
  result->conversion = conversion;
  return result;
}

void FreeTranscoder(Transcoder *transcoder) {
  iconv_close(transcoder->conversion);
  delete transcoder;
}

bool TranscodeUTF16ToUTF8(const Transcoder *transcoder, char *out, size_t out_bytes, const uint16_t *in, size_t in_length) {
  char *utf16_word = reinterpret_cast<char *>(const_cast<uint16_t *>(in));
  size_t utf16_bytes = in_length * (sizeof(uint16_t) / sizeof(char));

  size_t iconv_result = iconv(
    transcoder->conversion,
    &utf16_word,
    &utf16_bytes,
    &out,
    &out_bytes
  );

  if (iconv_result == static_cast<size_t>(-1)) {
    return false;
  }

  *out = '\0';
  return true;
}

}  // namespace spellchecker
