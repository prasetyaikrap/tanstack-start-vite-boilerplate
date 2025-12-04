import type { Facebook } from "./og-facebook";
import type { Twitter } from "./og-twitter";
import type { OpenGraph } from "./opengraph";

export type Author = {
	url?: string | URL | undefined;
	name?: string | undefined;
};

export type ReferrerEnum =
	| "no-referrer"
	| "origin"
	| "no-referrer-when-downgrade"
	| "origin-when-cross-origin"
	| "same-origin"
	| "strict-origin"
	| "strict-origin-when-cross-origin";

type LangCode =
	| "aa"
	| "ab"
	| "ae"
	| "af"
	| "ak"
	| "am"
	| "an"
	| "ar"
	| "as"
	| "av"
	| "ay"
	| "az"
	| "ba"
	| "be"
	| "bg"
	| "bh"
	| "bi"
	| "bm"
	| "bn"
	| "bo"
	| "br"
	| "bs"
	| "ca"
	| "ce"
	| "ch"
	| "co"
	| "cr"
	| "cs"
	| "cu"
	| "cv"
	| "cy"
	| "da"
	| "de"
	| "dv"
	| "dz"
	| "ee"
	| "el"
	| "en"
	| "eo"
	| "es"
	| "et"
	| "eu"
	| "fa"
	| "ff"
	| "fi"
	| "fj"
	| "fo"
	| "fr"
	| "fy"
	| "ga"
	| "gd"
	| "gl"
	| "gn"
	| "gu"
	| "gv"
	| "ha"
	| "he"
	| "hi"
	| "ho"
	| "hr"
	| "ht"
	| "hu"
	| "hy"
	| "hz"
	| "ia"
	| "id"
	| "ie"
	| "ig"
	| "ii"
	| "ik"
	| "io"
	| "is"
	| "it"
	| "iu"
	| "ja"
	| "jv"
	| "ka"
	| "kg"
	| "ki"
	| "kj"
	| "kk"
	| "kl"
	| "km"
	| "kn"
	| "ko"
	| "kr"
	| "ks"
	| "ku"
	| "kv"
	| "kw"
	| "ky"
	| "la"
	| "lb"
	| "lg"
	| "li"
	| "ln"
	| "lo"
	| "lt"
	| "lu"
	| "lv"
	| "mg"
	| "mh"
	| "mi"
	| "mk"
	| "ml"
	| "mn"
	| "mr"
	| "ms"
	| "mt"
	| "my"
	| "na"
	| "nb"
	| "nd"
	| "ne"
	| "ng"
	| "nl"
	| "nn"
	| "no"
	| "nr"
	| "nv"
	| "ny"
	| "oc"
	| "oj"
	| "om"
	| "or"
	| "os"
	| "pa"
	| "pi"
	| "pl"
	| "ps"
	| "pt"
	| "qu"
	| "rm"
	| "rn"
	| "ro"
	| "ru"
	| "rw"
	| "sa"
	| "sc"
	| "sd"
	| "se"
	| "sg"
	| "si"
	| "sk"
	| "sl"
	| "sm"
	| "sn"
	| "so"
	| "sq"
	| "sr"
	| "ss"
	| "st"
	| "su"
	| "sv"
	| "sw"
	| "ta"
	| "te"
	| "tg"
	| "th"
	| "ti"
	| "tk"
	| "tl"
	| "tn"
	| "to"
	| "tr"
	| "ts"
	| "tt"
	| "tw"
	| "ty"
	| "ug"
	| "uk"
	| "ur"
	| "uz"
	| "ve"
	| "vi"
	| "vo"
	| "wa"
	| "wo"
	| "xh"
	| "yi"
	| "yo"
	| "za"
	| "zh"
	| "zu"
	| "af-ZA"
	| "am-ET"
	| "ar-AE"
	| "ar-BH"
	| "ar-DZ"
	| "ar-EG"
	| "ar-IQ"
	| "ar-JO"
	| "ar-KW"
	| "ar-LB"
	| "ar-LY"
	| "ar-MA"
	| "arn-CL"
	| "ar-OM"
	| "ar-QA"
	| "ar-SA"
	| "ar-SD"
	| "ar-SY"
	| "ar-TN"
	| "ar-YE"
	| "as-IN"
	| "az-az"
	| "az-Cyrl-AZ"
	| "az-Latn-AZ"
	| "ba-RU"
	| "be-BY"
	| "bg-BG"
	| "bn-BD"
	| "bn-IN"
	| "bo-CN"
	| "br-FR"
	| "bs-Cyrl-BA"
	| "bs-Latn-BA"
	| "ca-ES"
	| "co-FR"
	| "cs-CZ"
	| "cy-GB"
	| "da-DK"
	| "de-AT"
	| "de-CH"
	| "de-DE"
	| "de-LI"
	| "de-LU"
	| "dsb-DE"
	| "dv-MV"
	| "el-CY"
	| "el-GR"
	| "en-029"
	| "en-AU"
	| "en-BZ"
	| "en-CA"
	| "en-cb"
	| "en-GB"
	| "en-IE"
	| "en-IN"
	| "en-JM"
	| "en-MT"
	| "en-MY"
	| "en-NZ"
	| "en-PH"
	| "en-SG"
	| "en-TT"
	| "en-US"
	| "en-ZA"
	| "en-ZW"
	| "es-AR"
	| "es-BO"
	| "es-CL"
	| "es-CO"
	| "es-CR"
	| "es-DO"
	| "es-EC"
	| "es-ES"
	| "es-GT"
	| "es-HN"
	| "es-MX"
	| "es-NI"
	| "es-PA"
	| "es-PE"
	| "es-PR"
	| "es-PY"
	| "es-SV"
	| "es-US"
	| "es-UY"
	| "es-VE"
	| "et-EE"
	| "eu-ES"
	| "fa-IR"
	| "fi-FI"
	| "fil-PH"
	| "fo-FO"
	| "fr-BE"
	| "fr-CA"
	| "fr-CH"
	| "fr-FR"
	| "fr-LU"
	| "fr-MC"
	| "fy-NL"
	| "ga-IE"
	| "gd-GB"
	| "gd-ie"
	| "gl-ES"
	| "gsw-FR"
	| "gu-IN"
	| "ha-Latn-NG"
	| "he-IL"
	| "hi-IN"
	| "hr-BA"
	| "hr-HR"
	| "hsb-DE"
	| "hu-HU"
	| "hy-AM"
	| "id-ID"
	| "ig-NG"
	| "ii-CN"
	| "in-ID"
	| "is-IS"
	| "it-CH"
	| "it-IT"
	| "iu-Cans-CA"
	| "iu-Latn-CA"
	| "iw-IL"
	| "ja-JP"
	| "ka-GE"
	| "kk-KZ"
	| "kl-GL"
	| "km-KH"
	| "kn-IN"
	| "kok-IN"
	| "ko-KR"
	| "ky-KG"
	| "lb-LU"
	| "lo-LA"
	| "lt-LT"
	| "lv-LV"
	| "mi-NZ"
	| "mk-MK"
	| "ml-IN"
	| "mn-MN"
	| "mn-Mong-CN"
	| "moh-CA"
	| "mr-IN"
	| "ms-BN"
	| "ms-MY"
	| "mt-MT"
	| "nb-NO"
	| "ne-NP"
	| "nl-BE"
	| "nl-NL"
	| "nn-NO"
	| "no-no"
	| "nso-ZA"
	| "oc-FR"
	| "or-IN"
	| "pa-IN"
	| "pl-PL"
	| "prs-AF"
	| "ps-AF"
	| "pt-BR"
	| "pt-PT"
	| "qut-GT"
	| "quz-BO"
	| "quz-EC"
	| "quz-PE"
	| "rm-CH"
	| "ro-mo"
	| "ro-RO"
	| "ru-mo"
	| "ru-RU"
	| "rw-RW"
	| "sah-RU"
	| "sa-IN"
	| "se-FI"
	| "se-NO"
	| "se-SE"
	| "si-LK"
	| "sk-SK"
	| "sl-SI"
	| "sma-NO"
	| "sma-SE"
	| "smj-NO"
	| "smj-SE"
	| "smn-FI"
	| "sms-FI"
	| "sq-AL"
	| "sr-BA"
	| "sr-CS"
	| "sr-Cyrl-BA"
	| "sr-Cyrl-CS"
	| "sr-Cyrl-ME"
	| "sr-Cyrl-RS"
	| "sr-Latn-BA"
	| "sr-Latn-CS"
	| "sr-Latn-ME"
	| "sr-Latn-RS"
	| "sr-ME"
	| "sr-RS"
	| "sr-sp"
	| "sv-FI"
	| "sv-SE"
	| "sw-KE"
	| "syr-SY"
	| "ta-IN"
	| "te-IN"
	| "tg-Cyrl-TJ"
	| "th-TH"
	| "tk-TM"
	| "tlh-QS"
	| "tn-ZA"
	| "tr-TR"
	| "tt-RU"
	| "tzm-Latn-DZ"
	| "ug-CN"
	| "uk-UA"
	| "ur-PK"
	| "uz-Cyrl-UZ"
	| "uz-Latn-UZ"
	| "uz-uz"
	| "vi-VN"
	| "wo-SN"
	| "xh-ZA"
	| "yo-NG"
	| "zh-CN"
	| "zh-HK"
	| "zh-MO"
	| "zh-SG"
	| "zh-TW"
	| "zh-Hans"
	| "zh-Hant"
	| "zu-ZA"
	| `${Lowercase<string>}-${string}`;
type UnmatchedLang = "x-default";
type HrefLang = LangCode | UnmatchedLang;
export type Languages<T> = {
	[s in HrefLang]?: T | undefined;
};
export type AlternateURLs = {
	canonical?: string;
	languages?: Languages<string> | undefined;
};

export type Metadata = {
	/**
	 * The document title.
	 *
	 * @remarks
	 * The title can be a simple string (e.g., `"My Blog"`) or an object with:
	 * - `default`: A fallback title for child segments.
	 * - `template`: A title template (e.g., `"%s | My Website"`) applied to child titles.
	 * - `absolute`: A title that overrides parent templates.
	 *
	 * @example
	 * ```tsx
	 * // As a simple string:
	 * title: "My Blog"
	 *
	 * // As a template object:
	 * title: { default: "Dashboard", template: "%s | My Website" }
	 *
	 * // Using absolute value (ignores parent template):
	 * title: { absolute: "My Blog", template: "%s | My Website" }
	 * ```
	 */
	title?: string;
	/**
	 * The document description, and optionally the Open Graph and Twitter descriptions.
	 *
	 * @example
	 * ```tsx
	 * description: "My Blog Description"
	 * // Renders: <meta name="description" content="My Blog Description" />
	 * ```
	 */
	description?: string;
	/**
	 * The application name.
	 *
	 * @example
	 * ```tsx
	 * applicationName: "My Blog"
	 * // Renders: <meta name="application-name" content="My Blog" />
	 * ```
	 */
	applicationName?: string;
	/**
	 * The authors of the document.
	 *
	 * @example
	 * ```tsx
	 * authors: [{ name: "Next.js Team", url: "https://nextjs.org" }]
	 * // Renders:
	 * // <meta name="author" content="Next.js Team" />
	 * // <link rel="author" href="https://nextjs.org" />
	 * ```
	 */
	authors?: Array<Author>;
	/**
	 * The generator used for the document.
	 *
	 * @example
	 * ```tsx
	 * generator: "Next.js"
	 * // Renders: <meta name="generator" content="Next.js" />
	 * ```
	 */
	generator?: string;
	/**
	 * The keywords for the document.
	 *
	 * @remarks
	 * When an array is provided, keywords are flattened into a comma-separated string.
	 *
	 * @example
	 * ```tsx
	 * keywords: "nextjs, react, blog"
	 * // or
	 * keywords: ["react", "server components"]
	 * ```
	 */
	keywords?: Array<string>;
	/**
	 * The referrer setting for the document.
	 *
	 * @example
	 * ```tsx
	 * referrer: "origin"
	 * // Renders: <meta name="referrer" content="origin" />
	 * ```
	 */
	referrer?: ReferrerEnum;
	/**
	 * The creator of the document.
	 *
	 * @example
	 * ```tsx
	 * creator: "Next.js Team"
	 * // Renders: <meta name="creator" content="Next.js Team" />
	 * ```
	 */
	creator?: string;
	/**
	 * The publisher of the document.
	 *
	 * @example
	 * ```tsx
	 * publisher: "Vercel"
	 * // Renders: <meta name="publisher" content="Vercel" />
	 * ```
	 */
	publisher?: string;
	/**
	 * The robots setting for the document.
	 *
	 * @remarks
	 * Can be a string (e.g., "index, follow") or an object with more granular rules.
	 *
	 * @example
	 * ```tsx
	 * robots: "index, follow"
	 * // or
	 * robots: { index: true, follow: true }
	 * ```
	 *
	 * @see https://developer.mozilla.org/docs/Glossary/Robots.txt
	 */
	robots?: string;
	/**
	 * The canonical and alternate URLs for the document.
	 *
	 * @remarks
	 * This field allows defining a canonical URL as well as alternate URLs (such as for multiple languages).
	 *
	 * @example
	 * ```tsx
	 * alternates: {
	 *   canonical: "https://example.com",
	 *   languages: {
	 *     "en-US": "https://example.com/en-US"
	 *   }
	 * }
	 * ```
	 */
	alternates?: null | AlternateURLs | undefined;
	/**
	 * The icons for the document. Defaults to rel="icon".
	 *
	 * @remarks
	 * You can specify a simple URL or an object to differentiate between icon types (e.g., apple-touch-icon).
	 *
	 * @example
	 * ```tsx
	 * icons: "https://example.com/icon.png"
	 * // or
	 * icons: {
	 *   icon: "https://example.com/icon.png",
	 *   apple: "https://example.com/apple-icon.png"
	 * }
	 * ```
	 *
	 * @see https://developer.mozilla.org/docs/Web/HTML/Attributes/rel#attr-icon
	 */
	icons?: string;
	/**
	 * A web application manifest, as defined in the Web Application Manifest specification.
	 *
	 * @example
	 * ```tsx
	 * manifest: "https://example.com/manifest.json"
	 * // Renders: <link rel="manifest" href="https://example.com/manifest.json" />
	 * ```
	 *
	 * @see https://developer.mozilla.org/docs/Web/Manifest
	 */
	manifest?: string;
	/**
	 * The Open Graph metadata for the document.
	 *
	 * @remarks
	 * Follows the Open Graph protocol to enrich link previews.
	 *
	 * @example
	 * ```tsx
	 * openGraph: {
	 *   type: "website",
	 *   url: "https://example.com",
	 *   title: "My Website",
	 *   description: "My Website Description",
	 *   siteName: "My Website",
	 *   images: [{ url: "https://example.com/og.png" }]
	 * }
	 * ```
	 *
	 * @see https://ogp.me/
	 */
	openGraph?: null | OpenGraph | undefined;
	/**
	 * The Twitter metadata for the document.
	 *
	 * @remarks
	 * - Used for configuring Twitter Cards and can include details such as `card`, `site`, and `creator`.
	 * - Notably, more sites than just Twitter (now X) use this format.
	 *
	 * @example
	 * ```tsx
	 * twitter: {
	 *   card: "summary_large_image",
	 *   site: "@site",
	 *   creator: "@creator",
	 *   images: "https://example.com/og.png"
	 * }
	 * ```
	 */
	twitter?: null | Twitter | undefined;
	/**
	 * The Facebook metadata for the document.
	 *
	 * @remarks
	 * Specify either `appId` or `admins` (but not both) to configure Facebook integration.
	 *
	 * @example
	 * ```tsx
	 * facebook: { appId: "12345678" }
	 * // Renders <meta property="fb:app_id" content="12345678" />
	 * // or
	 * facebook: { admins: ["12345678"] }
	 * // Renders <meta property="fb:admins" content="12345678" />
	 * ```
	 */
	facebook?: null | Facebook | undefined;
	/**
	 * A brief description of the web page.
	 *
	 * @remarks
	 * Rendered as the `abstract` meta tag. This is *not recommended* as it is superseded by `description`.
	 *
	 * @example
	 * ```tsx
	 * abstract: "My Website Description"
	 * // Renders <meta name="abstract" content="My Website Description" />
	 * ```
	 */
	abstract?: string;
	/**
	 * The archives link rel property.
	 *
	 * @example
	 * ```tsx
	 * archives: "https://example.com/archives"
	 * // Renders <link rel="archives" href="https://example.com/archives" />
	 * ```
	 */
	archives?: Array<string>;
	/**
	 * The assets link rel property.
	 *
	 * @example
	 * ```tsx
	 * assets: "https://example.com/assets"
	 * // Renders <link rel="assets" href="https://example.com/assets" />
	 * ```
	 */
	assets?: Array<string>;
	/**
	 * The bookmarks link rel property.
	 *
	 * @remarks
	 * Although technically against the HTML spec, this is used in practice.
	 *
	 * @example
	 * ```tsx
	 * bookmarks: "https://example.com/bookmarks"
	 * // Renders <link rel="bookmarks" href="https://example.com/bookmarks" />
	 * ```
	 */
	bookmarks?: Array<string>;
	/**
	 * The pagination link rel properties.
	 *
	 * @example
	 * ```tsx
	 * pagination: {
	 *   previous: "https://example.com/items?page=1",
	 *   next: "https://example.com/items?page=3"
	 * }
	 *
	 * // Renders
	 * <link rel="prev" href="https://example.com/items?page=1" />
	 * <link rel="next" href="https://example.com/items?page=3" />
	 * ```
	 *
	 * @see https://developers.google.com/search/blog/2011/09/pagination-with-relnext-and-relprev
	 */
	pagination?: {
		previous?: string;
		next?: string;
	};
	/**
	 * The category meta name property.
	 *
	 * @example
	 * ```tsx
	 * category: "My Category"
	 * // Renders <meta name="category" content="My Category" />
	 * ```
	 */
	category?: string;
	/**
	 * The classification meta name property.
	 *
	 * @example
	 * ```tsx
	 * classification: "My Classification"
	 * // Renders <meta name="classification" content="My Classification" />
	 * ```
	 */
	classification?: string;
	/**
	 * Arbitrary name/value pairs for additional metadata.
	 *
	 * @remarks
	 * Use this field to define custom meta tags that are not directly supported.
	 *
	 * @example
	 * ```tsx
	 * other: { custom: ["meta1", "meta2"] }
	 * ```
	 */
	other?: {
		[name: string]: string | number | Array<string | number>;
	};
	viewport?: string;
	charSet?: string;
};
