#include <vector>
#include <string>

#include <windows.h>
#include <stdlib.h>
#include "transcoder.h"
#include "buffers.h"

namespace spellchecker {

struct Transcoder {
  UINT from_code_page;
  UINT to_code_page;
};

// Pulled from csutil.cxx.
void toAsciiLowerAndRemoveNonAlphanumeric(const char* pName, char* pBuf)
{
    while ( *pName )
    {
        /* A-Z */
        if ( (*pName >= 0x41) && (*pName <= 0x5A) )
        {
            *pBuf = (*pName)+0x20;  /* toAsciiLower */
            pBuf++;
        }
        /* a-z, 0-9 */
        else if ( ((*pName >= 0x61) && (*pName <= 0x7A)) ||
                  ((*pName >= 0x30) && (*pName <= 0x39)) )
        {
            *pBuf = *pName;
            pBuf++;
        }

        pName++;
    }

    *pBuf = '\0';
}

UINT GetCodePage(const char *dictionary_encoding) {
  // Convert into a normalized form. We have to do this because humans are so
  // inconsistent with their encoding lines and we want to make this as
  // tolerant as possible.
  char *encoding = new char[strlen(dictionary_encoding)+1];
  toAsciiLowerAndRemoveNonAlphanumeric(dictionary_encoding, encoding);

  // The translation of code pages comes from:
  // https://docs.microsoft.com/en-us/windows/desktop/intl/code-page-identifiers
  if (!_stricmp(encoding, "utf8")) {
    return CP_UTF8;
  }

  if (!_stricmp(encoding, "iso88591")) {
    return 28591;
  }

  if (!_stricmp(encoding, "iso88592")) {
    return 28592;
  }

  if (!_stricmp(encoding, "iso88593")) {
    return 28593;
  }

  if (!_stricmp(encoding, "iso88594")) {
    return 28594;
  }

  if (!_stricmp(encoding, "iso88595")) {
    return 28595;
  }

  if (!_stricmp(encoding, "iso88596")) {
    return 28596;
  }

  if (!_stricmp(encoding, "iso88597")) {
    return 28597;
  }

  if (!_stricmp(encoding, "iso88598")) {
    return 28598;
  }

  if (!_stricmp(encoding, "iso88599")) {
    return 28599;
  }

  if (!_stricmp(encoding, "iso885910")) {
    return 28600;
  }

  if (!_stricmp(encoding, "iso885911") ||
      !_stricmp(encoding, "tis620")) {
    return 28601;
  }

  if (!_stricmp(encoding, "iso885913")) {
    return 28603;
  }

  if (!_stricmp(encoding, "iso885914")) {
    return 28604;
  }

  if (!_stricmp(encoding, "iso885915")) {
    return 28605;
  }

  if (!_stricmp(encoding, "koi8r") ||
      !_stricmp(encoding, "koi8u")) {
    return 20866;
  }

  if (!_stricmp(encoding, "cp1251") ||
      !_stricmp(encoding, "microsoftcp1251")) {
    return 1251;
  }

  if (!_stricmp(encoding, "xisciide") ||
      !_stricmp(encoding, "xisciias") ||
      !_stricmp(encoding, "isciidevangari")) {
    return 57002;
  }

  return -1;
}

Transcoder* NewUTF16ToUTF8Transcoder() {
  return new Transcoder();
}

Transcoder* NewTranscoder8to8(const char *from_encoding, const char *to_encoding) {
  Transcoder *result = new Transcoder();
  result->from_code_page = GetCodePage(from_encoding);
  result->to_code_page = GetCodePage(to_encoding);
  return result;
}

void FreeTranscoder(Transcoder *transcoder) {
  delete transcoder;
}

bool TranscodeUTF16ToUTF8(const Transcoder *transcoder, char *out, size_t out_length, const uint16_t *in, size_t in_length) {
  int length = WideCharToMultiByte(CP_UTF8, 0, reinterpret_cast<const wchar_t *>(in), in_length, out, out_length, NULL, NULL);
  out[length] = '\0';

  // Make sure the transcoded length doesn't exceed our buffers.
  return strlen(out) <= MAX_UTF8_BUFFER;
}

bool Transcode8to8(const Transcoder *transcoder, char *out, size_t out_length, const char *in, size_t in_length) {
  // If the transcoder is NULL, then we just copy the input buffer into the
  // output buffer and return the results without transcoding. We assume that
  // the callers had made sure the word is not longer than the output buffer.
  if (!transcoder) {
    // Copy the string and add the terminating character.
    std::memcpy(out, in, in_length);
    out[in_length] = '\0';
  } else {
    // There is no easy way to convert from these two formats, so we convert from
    // the input format into UTF-16 (wstring) first which appears to be the "right"
    // way of doing this.
    std::vector<wchar_t> utf16_buffer(256);
    int utf16_length;

    if (transcoder->from_code_page < 0) {
      return false;
    }

    utf16_length = MultiByteToWideChar(transcoder->from_code_page, 0, in, in_length, (LPWSTR)utf16_buffer.data(), utf16_buffer.size());

    // From the UTF-16 string, we convert it into our new page.
    // With the outgoing format, we need to convert it into something from the
    // wstring.
    int length = WideCharToMultiByte(transcoder->to_code_page, 0, reinterpret_cast<const wchar_t *>(utf16_buffer.data()), utf16_length, out, out_length, NULL, NULL);
    out[length] = '\0';
  }

  // Make sure the transcoded length doesn't exceed our buffers.
  return strlen(out) <= MAX_UTF8_BUFFER;
}

}  // namespace spellchecker
