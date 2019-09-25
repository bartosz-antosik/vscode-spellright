#ifndef SRC_TRANSCODER_H_
#define SRC_TRANSCODER_H_

#include <stdlib.h>
#include <stdint.h>

namespace spellchecker {

struct Transcoder;

// Used to convert from V8's UTF-16 strings into UTF-8.
Transcoder *NewUTF16ToUTF8Transcoder();

// Used to convert from UTF-8 into the dictionary-specific format.
Transcoder *NewTranscoder8to8(const char *from_encoding, const char *to_encoding);

void FreeTranscoder(Transcoder *);

// Transcodes UTF-16 to UTF-8.
bool TranscodeUTF16ToUTF8(const Transcoder *, char *out, size_t out_length, const uint16_t *in, size_t in_length);

// Transcode UTF-8 to a specified format.
bool Transcode8to8(const Transcoder *, char *out, size_t out_length, const char *in, size_t in_length);

}  // namespace spellchecker

#endif  // SRC_TRANSCODER_H_
