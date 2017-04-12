// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

var c2l = {
    'af':'Afrikaans',
    'af-ZA':'Afrikaans - South Africa',
    'ar':'Arabic',
    'ar-AE':'Arabic - United Arab Emirates',
    'ar-BH':'Arabic - Bahrain',
    'ar-DZ':'Arabic - Algeria',
    'ar-EG':'Arabic - Egypt',
    'ar-IQ':'Arabic - Iraq',
    'ar-JO':'Arabic - Jordan',
    'ar-KW':'Arabic - Kuwait',
    'ar-LB':'Arabic - Lebanon',
    'ar-LY':'Arabic - Libya',
    'ar-MA':'Arabic - Morocco',
    'ar-OM':'Arabic - Oman',
    'ar-QA':'Arabic - Qatar',
    'ar-SA':'Arabic - Saudi Arabia',
    'ar-SY':'Arabic - Syria',
    'ar-TN':'Arabic - Tunisia',
    'ar-YE':'Arabic - Yemen',
    'az':'Azeri',
    'az-Cyrl':'Azeri (Cyrillic)',
    'az-Cyrl-AZ':'Azeri (Cyrillic) - Azerbaijan',
    'az-Latn':'Azeri (Latin)',
    'az-Latn-AZ':'Azeri (Latin) - Azerbaijan',
    'be':'Belarusian',
    'be-BY':'Belarusian - Belarus',
    'bg':'Bulgarian',
    'bg-BG':'Bulgarian - Bulgaria',
    'bs':'Bosnian',
    'bs-Cyrl':'Bosnian (Cyrillic)',
    'bs-Cyrl-BA':'Bosnian (Cyrillic) - Bosnia and Herzegovina',
    'bs-Latn':'Bosnian (Latin)',
    'bs-Latn-BA':'Bosnian (Cyrillic) - Bosnia and Herzegovina',
    'ca':'Catalan',
    'ca-ES':'Catalan - Catalan',
    'cs':'Czech',
    'cs-CZ':'Czech - Czech Republic',
    'da':'Danish',
    'da-DK':'Danish - Denmark',
    'de':'German',
    'de-AT':'German - Austria',
    'de-CH':'German - Switzerland',
    'de-DE':'German - Germany',
    'de-LI':'German - Liechtenstein',
    'de-LU':'German - Luxembourg',
    'dv':'Dhivehi',
    'dv-MV':'Dhivehi - Maldives',
    'el':'Greek',
    'el-GR':'Greek - Greece',
    'en':'English',
    'en-AU':'English - Australia',
    'en-BZ':'English - Belize',
    'en-CA':'English - Canada',
    'en-029':'English - Caribbean',
    'en-GB':'English - United Kingdom',
    'en-IE':'English - Ireland',
    'en-JM':'English - Jamaica',
    'en-NZ':'English - New Zealand',
    'en-PH':'English - Philippines',
    'en-TT':'English - Trinidad and Tobago',
    'en-US':'English - United States',
    'en-ZA':'English - South Africa',
    'en-ZW':'English - Zimbabwe',
    'en-LR':'English - Liberia',
    'es':'Spanish',
    'es-AR':'Spanish - Argentina',
    'es-BO':'Spanish - Bolivia',
    'es-CL':'Spanish - Chile',
    'es-CO':'Spanish - Colombia',
    'es-CR':'Spanish - Costa Rica',
    'es-DO':'Spanish - Dominican Republic',
    'es-EC':'Spanish - Ecuador',
    'es-ES':'Spanish - Spain',
    'es-GT':'Spanish - Guatemala',
    'es-HN':'Spanish - Honduras',
    'es-MX':'Spanish - Mexico',
    'es-NI':'Spanish - Nicaragua',
    'es-PA':'Spanish - Panama',
    'es-PE':'Spanish - Peru',
    'es-PR':'Spanish - Puerto Rico',
    'es-PY':'Spanish - Paraguay',
    'es-SV':'Spanish - El Salvador',
    'es-UY':'Spanish - Uruguay',
    'es-VE':'Spanish - Venezuela',
    'et':'Estonian',
    'et-EE':'Estonian - Estonia',
    'eu':'Basque',
    'eu-ES':'Basque - Basque',
    'fa':'Farsi',
    'fa-IR':'Farsi - Iran',
    'fi':'Finnish',
    'fi-FI':'Finnish - Finland',
    'fo':'Faroese',
    'fo-FO':'Faroese - Faroe Islands',
    'fr':'French',
    'fr-BE':'French - Belgium',
    'fr-CA':'French - Canada',
    'fr-CH':'French - Switzerland',
    'fr-FR':'French - France',
    'fr-LU':'French - Luxembourg',
    'fr-MC':'French - Monaco',
    'fr-CD':'French - Congo',
    'fr-CI':'French - Côte D\'ivoire',
    'fr-CM':'French - Cameroon',
    'fr-HT':'French - Haiti',
    'gl':'Galician',
    'gl-ES':'Galician - Galician',
    'gu':'Gujarati',
    'gu-IN':'Gujarati - India',
    'he':'Hebrew',
    'he-IL':'Hebrew - Israel',
    'hi':'Hindi',
    'hi-IN':'Hindi - India',
    'hr':'Croatian',
    'hr-HR':'Croatian - Croatia',
    'hu':'Hungarian',
    'hu-HU':'Hungarian - Hungary',
    'hy':'Armenian',
    'hy-AM':'Armenian - Armenia',
    'id':'Indonesian',
    'id-ID':'Indonesian - Indonesia',
    'is':'Icelandic',
    'is-IS':'Icelandic - Iceland',
    'it':'Italian',
    'it-CH':'Italian - Switzerland',
    'it-IT':'Italian - Italy',
    'iu':'Inuktitut',
    'iu-Latn':'Inuktitut (Latin)',
    'iu-Latn-CA':'Inuktitut (Latin) - Canada',
    'ja':'Japanese',
    'ja-JP':'Japanese - Japan',
    'ka':'Georgian',
    'ka-GE':'Georgian - Georgia',
    'kk':'Kazakh',
    'kk-KZ':'Kazakh - Kazakhstan',
    'kn':'Kannada',
    'kn-IN':'Kannada - India',
    'ko':'Korean',
    'kok':'Konkani',
    'kok-IN':'Konkani - India',
    'ko-KR':'Korean - Korea',
    'ky':'Kyrgyz',
    'ky-KG':'Kyrgyz - Kyrgyzstan',
    'lt':'Lithuanian',
    'lt-LT':'Lithuanian - Lithuania',
    'lv':'Latvian',
    'lv-LV':'Latvian - Latvia',
    'mk':'Macedonian',
    'mk-MK':'Macedonian - Former Yugoslav Republic of Macedonia',
    'mn':'Mongolian',
    'mn-MN':'Mongolian - Mongolia',
    'mr':'Marathi',
    'mr-IN':'Marathi - India',
    'ms':'Malay',
    'ms-BN':'Malay - Brunei',
    'ms-MY':'Malay - Malaysia',
    'nb-NO':'Norwegian (Bokmål) - Norway',
    'nl':'Dutch',
    'nl-BE':'Dutch - Belgium',
    'nl-NL':'Dutch - The Netherlands',
    'nn-NO':'Norwegian (Nynorsk) - Norway',
    'no':'Norwegian',
    'pa':'Punjabi',
    'pa-IN':'Punjabi - India',
    'pl':'Polish',
    'pl-PL':'Polish - Poland',
    'pt':'Portuguese',
    'pt-BR':'Portuguese - Brazil',
    'pt-PT':'Portuguese - Portugal',
    'ro':'Romanian',
    'ro-RO':'Romanian - Romania',
    'ru':'Russian',
    'ru-RU':'Russian - Russia',
    'sa':'Sanskrit',
    'sa-IN':'Sanskrit - India',
    'sk':'Slovak',
    'sk-SK':'Slovak - Slovakia',
    'sl':'Slovenian',
    'sl-SI':'Slovenian - Slovenia',
    'sq':'Albanian',
    'sq-AL':'Albanian - Albania',
    'mn-Cyrl':'Mongolian (Cyrillic)',
    'sr':'Serbian',
    'sr-Cyrl':'Serbian (Cyrillic)',
    'sr-Cyrl-BA':'Serbian (Cyrillic) - Bosnia and Herzegovina',
    'sr-Cyrl-CS':'Serbian (Cyrillic) - Serbia',
    'sr-Latn':'Serbian (Latin)',
    'sr-Latn-BA':'Serbian (Latin) - Bosnia and Herzegovina',
    'sr-Latn-CS':'Serbian (Latin) - Serbia',
    'sv':'Swedish',
    'sv-FI':'Swedish - Finland',
    'sv-SE':'Swedish - Sweden',
    'sw':'Swahili',
    'sw-KE':'Swahili - Kenya',
    'syr':'Syriac',
    'syr-SY':'Syriac - Syria',
    'ta':'Tamil',
    'ta-IN':'Tamil - India',
    'te':'Telugu',
    'te-IN':'Telugu - India',
    'th':'Thai',
    'th-TH':'Thai - Thailand',
    'tr':'Turkish',
    'tr-TR':'Turkish - Turkey',
    'tt':'Tatar',
    'tt-RU':'Tatar - Russia',
    'uk':'Ukrainian',
    'uk-UA':'Ukrainian - Ukraine',
    'ur':'Urdu',
    'ur-PK':'Urdu - Pakistan',
    'uz':'Uzbek',
    'uz-Cyrl':'Uzbek (Cyrillic)',
    'uz-Latn':'Uzbek (Latin)',
    'uz-Cyrl-UZ':'Uzbek (Cyrillic) - Uzbekistan',
    'uz-Latn-UZ':'Uzbek (Latin) - Uzbekistan',
    'vi':'Vietnamese',
    'vi-VN':'Vietnamese - Vietnam',
    'zh':'Chinese',
    'zh-CHT':'Chinese (Traditional)',
    'zh-CHS':'Chinese (Simplified)',
    'zh-CN':'Chinese - China',
    'zh-HK':'Chinese - Hong Kong SAR',
    'zh-MO':'Chinese - Macao SAR',
    'zh-SG':'Chinese - Singapore',
    'zh-TW':'Chinese - Taiwan',
    'zh-Hans':'Chinese (Simplified, Hans)',
    'zh-Hant':'Chinese (Traditional, Hans)'
}

var code2LanguageCulture = function () {
    return function(code) {
        return c2l[code.replace(/_/g, '-')];
    };
}();

var code2Language = function () {
    return function(code) {
        var _code = code.replace(/_/g, '-');
        if (_code in c2l) {
            r = c2l[_code];
            return (r.indexOf(' - ') < 0) ? r : r.substring(0, r.indexOf(' - '));
        } else {
            return undefined;
        }
    };
}();

var language2Code = function () {
    return function (language) {
        for (var k in c2l) {
            if (c2l[k] === language) {
                return k;
            }
        }
        return undefined;
    };
}();

exports.code2LanguageCulture = code2LanguageCulture;
exports.code2Language = code2Language;
exports.language2Code = language2Code;

var d2s = [
]

var showDictionary = function () {
    return function (code) {
        for (i = 0; i < d2s.length; i++) {
            var r = new RegExp(d2s[i], '');
            if (r.test(code)) {
                return true;
            }
        }
        return false;
    };
}();

exports.showDictionary = showDictionary;
