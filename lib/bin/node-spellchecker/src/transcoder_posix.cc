#include <cstring>
#include <iconv.h>
#include <stdint.h>
#include <stdlib.h>
#include "buffers.h"

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

Transcoder *NewUTF16ToUTF8Transcoder() {
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

Transcoder *NewTranscoder8to8(const char *from_encoding, const char *to_encoding) {
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

  // Make sure the transcoded length doesn't exceed our buffers.
  return strlen(out) <= MAX_UTF8_BUFFER;
}

bool Transcode8to8(const Transcoder *transcoder, char *out, size_t out_length, const char *in, size_t in_length) {
  // If the transcoder is NULL, then we just copy the input buffer into the
  // output buffer and return the results without transcoding. We assume that
  // the callers had made sure the word is not longer than the output buffer.
  char *utf8_word = reinterpret_cast<char *>(const_cast<char *>(in));

  if (!transcoder) {
    // Copy the string and add the terminating character.
    std::memcpy(out, in, in_length);
    out[in_length] = '\0';
  } else {
    // We have a transcoder, so transcode the contents.
    size_t iconv_result = iconv(
      transcoder->conversion,
      &utf8_word,
      &in_length,
      &out,
      &out_length
    );

    if (iconv_result == static_cast<size_t>(-1)) {
      return false;
    }

    *out = '\0';
  }

  // Make sure the transcoded length doesn't exceed our buffers.
  return strlen(out) <= MAX_UTF8_BUFFER;
}

}  // namespace spellchecker
