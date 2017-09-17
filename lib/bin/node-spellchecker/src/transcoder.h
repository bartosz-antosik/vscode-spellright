#ifndef SRC_TRANSCODER_H_
#define SRC_TRANSCODER_H_

#include <stdlib.h>
#include <stdint.h>

namespace spellchecker {

struct Transcoder;

Transcoder *NewTranscoder();
void FreeTranscoder(Transcoder *);
bool TranscodeUTF16ToUTF8(const Transcoder *, char *out, size_t out_length, const uint16_t *in, size_t in_length);

}  // namespace spellchecker

#endif  // SRC_TRANSCODER_H_
