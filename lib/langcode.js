// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2019 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

var c2l = {
    'af':'Afrikaans',
    'af-za':'Afrikaans - South Africa',
    'ar':'Arabic',
    'ar-ae':'Arabic - United Arab Emirates',
    'ar-bh':'Arabic - Bahrain',
    'ar-dz':'Arabic - Algeria',
    'ar-eg':'Arabic - Egypt',
    'ar-iq':'Arabic - Iraq',
    'ar-jo':'Arabic - Jordan',
    'ar-kw':'Arabic - Kuwait',
    'ar-lb':'Arabic - Lebanon',
    'ar-ly':'Arabic - Libya',
    'ar-ma':'Arabic - Morocco',
    'ar-om':'Arabic - Oman',
    'ar-qa':'Arabic - Qatar',
    'ar-sa':'Arabic - Saudi Arabia',
    'ar-sy':'Arabic - Syria',
    'ar-tn':'Arabic - Tunisia',
    'ar-ye':'Arabic - Yemen',
    'az':'Azeri',
    'az-cyrl':'Azeri (Cyrillic)',
    'az-cyrl-az':'Azeri (Cyrillic) - Azerbaijan',
    'az-latn':'Azeri (Latin)',
    'az-latn-az':'Azeri (Latin) - Azerbaijan',
    'be':'Belarusian',
    'be-by':'Belarusian - Belarus',
    'bg':'Bulgarian',
    'bg-bg':'Bulgarian - Bulgaria',
    'bs':'Bosnian',
    'bs-cyrl':'Bosnian (Cyrillic)',
    'bs-cyrl-ba':'Bosnian (Cyrillic) - Bosnia and Herzegovina',
    'bs-latn':'Bosnian (Latin)',
    'bs-latn-ba':'Bosnian (Cyrillic) - Bosnia and Herzegovina',
    'ca':'Catalan',
    'ca-es':'Catalan - Catalan',
    'cs':'Czech',
    'cs-cz':'Czech - Czech Republic',
    'da':'Danish',
    'da-dk':'Danish - Denmark',
    'de':'German',
    'de-at':'German - Austria',
    'de-ch':'German - Switzerland',
    'de-de':'German - Germany',
    'de-li':'German - Liechtenstein',
    'de-lu':'German - Luxembourg',
    'dv':'Dhivehi',
    'dv-mv':'Dhivehi - Maldives',
    'el':'Greek',
    'el-gr':'Greek - Greece',
    'en':'English',
    'en-au':'English - Australia',
    'en-bz':'English - Belize',
    'en-ca':'English - Canada',
    'en-029':'English - Caribbean',
    'en-gb':'English - United Kingdom',
    'en-ie':'English - Ireland',
    'en-jm':'English - Jamaica',
    'en-nz':'English - New Zealand',
    'en-ph':'English - Philippines',
    'en-tt':'English - Trinidad and Tobago',
    'en-us':'English - United States',
    'en-za':'English - South Africa',
    'en-zw':'English - Zimbabwe',
    'en-lr':'English - Liberia',
    'es':'Spanish',
    'es-ar':'Spanish - Argentina',
    'es-bo':'Spanish - Bolivia',
    'es-cl':'Spanish - Chile',
    'es-co':'Spanish - Colombia',
    'es-cr':'Spanish - Costa Rica',
    'es-do':'Spanish - Dominican Republic',
    'es-ec':'Spanish - Ecuador',
    'es-es':'Spanish - Spain',
    'es-gt':'Spanish - Guatemala',
    'es-hn':'Spanish - Honduras',
    'es-mx':'Spanish - Mexico',
    'es-ni':'Spanish - Nicaragua',
    'es-pa':'Spanish - Panama',
    'es-pe':'Spanish - Peru',
    'es-pr':'Spanish - Puerto Rico',
    'es-py':'Spanish - Paraguay',
    'es-sv':'Spanish - El Salvador',
    'es-uy':'Spanish - Uruguay',
    'es-ve':'Spanish - Venezuela',
    'et':'Estonian',
    'et-ee':'Estonian - Estonia',
    'eu':'Basque',
    'eu-es':'Basque - Basque',
    'fa':'Farsi',
    'fa-ir':'Farsi - Iran',
    'fi':'Finnish',
    'fi-fi':'Finnish - Finland',
    'fo':'Faroese',
    'fo-fo':'Faroese - Faroe Islands',
    'fr':'French',
    'fr-be':'French - Belgium',
    'fr-ca':'French - Canada',
    'fr-ch':'French - Switzerland',
    'fr-fr':'French - France',
    'fr-lu':'French - Luxembourg',
    'fr-mc':'French - Monaco',
    'fr-cd':'French - Congo',
    'fr-ci':'French - Côte D\'ivoire',
    'fr-cm':'French - Cameroon',
    'fr-ht':'French - Haiti',
    'gl':'Galician',
    'gl-es':'Galician - Galician',
    'gu':'Gujarati',
    'gu-in':'Gujarati - India',
    'he':'Hebrew',
    'he-il':'Hebrew - Israel',
    'hi':'Hindi',
    'hi-in':'Hindi - India',
    'hr':'Croatian',
    'hr-hr':'Croatian - Croatia',
    'hu':'Hungarian',
    'hu-hu':'Hungarian - Hungary',
    'hy':'Armenian',
    'hy-am':'Armenian - Armenia',
    'id':'Indonesian',
    'id-id':'Indonesian - Indonesia',
    'is':'Icelandic',
    'is-is':'Icelandic - Iceland',
    'it':'Italian',
    'it-ch':'Italian - Switzerland',
    'it-it':'Italian - Italy',
    'iu':'Inuktitut',
    'iu-latn':'Inuktitut (Latin)',
    'iu-latn-ca':'Inuktitut (Latin) - Canada',
    'ja':'Japanese',
    'ja-jp':'Japanese - Japan',
    'ka':'Georgian',
    'ka-ge':'Georgian - Georgia',
    'kk':'Kazakh',
    'kk-kz':'Kazakh - Kazakhstan',
    'kn':'Kannada',
    'kn-in':'Kannada - India',
    'ko':'Korean',
    'kok':'Konkani',
    'kok-in':'Konkani - India',
    'ko-kr':'Korean - Korea',
    'ky':'Kyrgyz',
    'ky-kg':'Kyrgyz - Kyrgyzstan',
    'lt':'Lithuanian',
    'lt-lt':'Lithuanian - Lithuania',
    'lv':'Latvian',
    'lv-lv':'Latvian - Latvia',
    'mk':'Macedonian',
    'mk-mk':'Macedonian - Former Yugoslav Republic of Macedonia',
    'mn':'Mongolian',
    'mn-mn':'Mongolian - Mongolia',
    'mr':'Marathi',
    'mr-in':'Marathi - India',
    'ms':'Malay',
    'ms-bn':'Malay - Brunei',
    'ms-my':'Malay - Malaysia',
    'nb-no':'Norwegian (Bokmål) - Norway',
    'nb':'Norwegian (Bokmål) - Norway',
    'nl':'Dutch',
    'nl-be':'Dutch - Belgium',
    'nl-nl':'Dutch - The Netherlands',
    'nn-no':'Norwegian (Nynorsk) - Norway',
    'nn':'Norwegian (Nynorsk) - Norway',
    'no':'Norwegian',
    'pa':'Punjabi',
    'pa-in':'Punjabi - India',
    'pl':'Polish',
    'pl-pl':'Polish - Poland',
    'pt':'Portuguese',
    'pt-br':'Portuguese - Brazil',
    'pt-pt':'Portuguese - Portugal',
    'ro':'Romanian',
    'ro-ro':'Romanian - Romania',
    'ru':'Russian',
    'ru-ru':'Russian - Russia',
    'sa':'Sanskrit',
    'sa-in':'Sanskrit - India',
    'sk':'Slovak',
    'sk-sk':'Slovak - Slovakia',
    'sl':'Slovenian',
    'sl-si':'Slovenian - Slovenia',
    'sq':'Albanian',
    'sq-al':'Albanian - Albania',
    'mn-cyrl':'Mongolian (Cyrillic)',
    'sr':'Serbian',
    'sr-cyrl':'Serbian (Cyrillic)',
    'sr-cyrl-ba':'Serbian (Cyrillic) - Bosnia and Herzegovina',
    'sr-cyrl-cs':'Serbian (Cyrillic) - Serbia',
    'sr-latn':'Serbian (Latin)',
    'sr-latn-ba':'Serbian (Latin) - Bosnia and Herzegovina',
    'sr-latn-cs':'Serbian (Latin) - Serbia',
    'sv':'Swedish',
    'sv-fi':'Swedish - Finland',
    'sv-se':'Swedish - Sweden',
    'sw':'Swahili',
    'sw-ke':'Swahili - Kenya',
    'syr':'Syriac',
    'syr-sy':'Syriac - Syria',
    'ta':'Tamil',
    'ta-in':'Tamil - India',
    'te':'Telugu',
    'te-in':'Telugu - India',
    'th':'Thai',
    'th-th':'Thai - Thailand',
    'tr':'Turkish',
    'tr-tr':'Turkish - Turkey',
    'tt':'Tatar',
    'tt-ru':'Tatar - Russia',
    'uk':'Ukrainian',
    'uk-ua':'Ukrainian - Ukraine',
    'ur':'Urdu',
    'ur-pk':'Urdu - Pakistan',
    'uz':'Uzbek',
    'uz-cyrl':'Uzbek (Cyrillic)',
    'uz-latn':'Uzbek (Latin)',
    'uz-cyrl-uz':'Uzbek (Cyrillic) - Uzbekistan',
    'uz-latn-uz':'Uzbek (Latin) - Uzbekistan',
    'vi':'Vietnamese',
    'vi-vn':'Vietnamese - Vietnam',
    'zh':'Chinese',
    'zh-cht':'Chinese (Traditional)',
    'zh-chs':'Chinese (Simplified)',
    'zh-cn':'Chinese - China',
    'zh-hk':'Chinese - Hong Kong SAR',
    'zh-mo':'Chinese - Macao SAR',
    'zh-sg':'Chinese - Singapore',
    'zh-tw':'Chinese - Taiwan',
    'zh-hans':'Chinese (Simplified, Hans)',
    'zh-hant':'Chinese (Traditional, Hans)'
}

var code2LanguageCulture = function () {
    return function(code) {
        return c2l[code.replace(/_/g, '-').toLowerCase()];
    };
}();

var code2Language = function () {
    return function(code) {
        var _code = code.replace(/_/g, '-').toLowerCase();
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
