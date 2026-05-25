'use client';

export type FallbackReferenceLookupType = 'nation' | 'province' | 'busType' | 'charterCode';

export type FallbackReferenceItem = {
  id: string;
  type: FallbackReferenceLookupType;
  code: string;
  name: string;
  secondaryName: string;
  nationCode: string;
};

const fallbackReferenceItems: FallbackReferenceItem[] = [
  {
    "id": "fallback-nation",
    "type": "nation",
    "code": "-",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ad",
    "type": "nation",
    "code": "AD",
    "name": "ANDORRA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ae",
    "type": "nation",
    "code": "AE",
    "name": "UNITED ARAB EMIRATES (UAE.)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-aeu",
    "type": "nation",
    "code": "AEU",
    "name": "Asia In Europe & America",
    "secondaryName": "เอเซียในยุโรป และอเมริกา",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-af",
    "type": "nation",
    "code": "AF",
    "name": "AFGHANISTAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ag",
    "type": "nation",
    "code": "AG",
    "name": "ANTIGUA AND BARBUDA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ai",
    "type": "nation",
    "code": "AI",
    "name": "ANGUILLA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-al",
    "type": "nation",
    "code": "AL",
    "name": "ALBANIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-all",
    "type": "nation",
    "code": "ALL",
    "name": "ALL NATION",
    "secondaryName": "ทุกชนชาติ",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-am",
    "type": "nation",
    "code": "AM",
    "name": "AMENIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ao",
    "type": "nation",
    "code": "AO",
    "name": "ANGOLA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-aq",
    "type": "nation",
    "code": "AQ",
    "name": "ANTARCTICA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ar",
    "type": "nation",
    "code": "AR",
    "name": "ARGENTINA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-as",
    "type": "nation",
    "code": "AS",
    "name": "AMERICAN SAMOA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-at",
    "type": "nation",
    "code": "AT",
    "name": "AUSTRIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-au",
    "type": "nation",
    "code": "AU",
    "name": "AUSTRALIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-aus",
    "type": "nation",
    "code": "AUS",
    "name": "CHINESE IN AUSTRALIA",
    "secondaryName": "จีนในออสเตรเลีย",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-aw",
    "type": "nation",
    "code": "AW",
    "name": "ARUBA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ax",
    "type": "nation",
    "code": "AX",
    "name": "ALAND ISLAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-az",
    "type": "nation",
    "code": "AZ",
    "name": "AZERBAIJAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ba",
    "type": "nation",
    "code": "BA",
    "name": "BOSNIA AND HERZEGOVINA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bb",
    "type": "nation",
    "code": "BB",
    "name": "BARBADOS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bd",
    "type": "nation",
    "code": "BD",
    "name": "BANGLADESH",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-be",
    "type": "nation",
    "code": "BE",
    "name": "BELGIUM",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bf",
    "type": "nation",
    "code": "BF",
    "name": "BURKINA FASO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bg",
    "type": "nation",
    "code": "BG",
    "name": "BULGARIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bh",
    "type": "nation",
    "code": "BH",
    "name": "BAHRAIN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bi",
    "type": "nation",
    "code": "BI",
    "name": "BURUNDI",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bj",
    "type": "nation",
    "code": "BJ",
    "name": "BENIN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bl",
    "type": "nation",
    "code": "BL",
    "name": "SAINT BARTHELEMY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bm",
    "type": "nation",
    "code": "BM",
    "name": "BERMUDA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bn",
    "type": "nation",
    "code": "BN",
    "name": "BRUNIE DARUSSALAM",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bo",
    "type": "nation",
    "code": "BO",
    "name": "BOLIVIA,PLURINATIONAL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bq",
    "type": "nation",
    "code": "BQ",
    "name": "BONAIRE,SINT EUSTATIUS AND SABA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-br",
    "type": "nation",
    "code": "BR",
    "name": "BRAZIL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bs",
    "type": "nation",
    "code": "BS",
    "name": "BAHAMAS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bt",
    "type": "nation",
    "code": "BT",
    "name": "BHUTAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bv",
    "type": "nation",
    "code": "BV",
    "name": "BOUVET ISLAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bw",
    "type": "nation",
    "code": "BW",
    "name": "BOTSWANA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-by",
    "type": "nation",
    "code": "BY",
    "name": "BELARUS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-bz",
    "type": "nation",
    "code": "BZ",
    "name": "BELIZE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-c",
    "type": "nation",
    "code": "C",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-c0288",
    "type": "nation",
    "code": "C0288",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-c0341",
    "type": "nation",
    "code": "C0341",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ca",
    "type": "nation",
    "code": "CA",
    "name": "CANADA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cc",
    "type": "nation",
    "code": "CC",
    "name": "COCOS (KEELING) ISLANDS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cd",
    "type": "nation",
    "code": "CD",
    "name": "CONGO,THE DEMOCRATIC REPUBLIC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cd10",
    "type": "nation",
    "code": "CD10",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cf",
    "type": "nation",
    "code": "CF",
    "name": "CENTRAL AFRICAN REPLUBLIC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cfr",
    "type": "nation",
    "code": "CFR",
    "name": "CHINA-FR",
    "secondaryName": "จีนในฝรั่งเศส",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cg",
    "type": "nation",
    "code": "CG",
    "name": "CONGO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ch",
    "type": "nation",
    "code": "CH",
    "name": "SWITZERLAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ci",
    "type": "nation",
    "code": "CI",
    "name": "COTE D'IVOIRE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ck",
    "type": "nation",
    "code": "CK",
    "name": "COOK ISLANDS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cl",
    "type": "nation",
    "code": "CL",
    "name": "CHILE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cm",
    "type": "nation",
    "code": "CM",
    "name": "CAMEROON",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cn",
    "type": "nation",
    "code": "CN",
    "name": "CHINA",
    "secondaryName": "จีน",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cnz",
    "type": "nation",
    "code": "CNZ",
    "name": "Chinese In New Zealand",
    "secondaryName": "จีนในนิวซีแลนด์",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-co",
    "type": "nation",
    "code": "CO",
    "name": "COLOMBIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cr",
    "type": "nation",
    "code": "CR",
    "name": "COSTA RICA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cu",
    "type": "nation",
    "code": "CU",
    "name": "CUBA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cus",
    "type": "nation",
    "code": "CUS",
    "name": "CHINA IN USA",
    "secondaryName": "จีนในอเมริกา",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cv",
    "type": "nation",
    "code": "CV",
    "name": "CAPE VERDE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cvn",
    "type": "nation",
    "code": "CVN",
    "name": "CHINA IN VIETNAM",
    "secondaryName": "จีนในเวียดนาม",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cw",
    "type": "nation",
    "code": "CW",
    "name": "CURACAO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cx",
    "type": "nation",
    "code": "CX",
    "name": "CHRISTMAS ISLAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cy",
    "type": "nation",
    "code": "CY",
    "name": "CYPRUS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-cz",
    "type": "nation",
    "code": "CZ",
    "name": "CZECH REPUBLIC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-db",
    "type": "nation",
    "code": "DB",
    "name": "DUBAI",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-de",
    "type": "nation",
    "code": "DE",
    "name": "GERMANY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-dj",
    "type": "nation",
    "code": "DJ",
    "name": "DJIBOUTI",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-dk",
    "type": "nation",
    "code": "DK",
    "name": "DENMARK",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-dm",
    "type": "nation",
    "code": "DM",
    "name": "DOMINICA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-do",
    "type": "nation",
    "code": "DO",
    "name": "DOMINICAN REPUBLIC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-dz",
    "type": "nation",
    "code": "DZ",
    "name": "ALGERIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ec",
    "type": "nation",
    "code": "EC",
    "name": "ECUADOR",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-eg",
    "type": "nation",
    "code": "EG",
    "name": "EGYPT",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-eh",
    "type": "nation",
    "code": "EH",
    "name": "WESTERN SAHARA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-eree",
    "type": "nation",
    "code": "EREE",
    "name": "ERITREAESTONIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-es",
    "type": "nation",
    "code": "ES",
    "name": "SPAIN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-et",
    "type": "nation",
    "code": "ET",
    "name": "ETHIOPIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-eu",
    "type": "nation",
    "code": "EU",
    "name": "EUROPE",
    "secondaryName": "ยุโรป",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-fa",
    "type": "nation",
    "code": "FA",
    "name": "FALKLAND ISLANDS(MALVINAS)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-fi",
    "type": "nation",
    "code": "FI",
    "name": "FINLAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-fj",
    "type": "nation",
    "code": "FJ",
    "name": "FIJI",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-fm",
    "type": "nation",
    "code": "FM",
    "name": "MICRONESIA'FEDERATED STATES OF",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-fo",
    "type": "nation",
    "code": "FO",
    "name": "FAROE ISLANDS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-fr",
    "type": "nation",
    "code": "FR",
    "name": "FRANCE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-fus",
    "type": "nation",
    "code": "FUS",
    "name": "FRANCE-USA",
    "secondaryName": "ฝรั่งเศสในอเมริกา",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ga",
    "type": "nation",
    "code": "GA",
    "name": "GABON",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gb",
    "type": "nation",
    "code": "GB",
    "name": "UNITED KINGDOM (ENGLAND)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gd",
    "type": "nation",
    "code": "GD",
    "name": "GUANGDONG,    (GRENADA)",
    "secondaryName": "กวางตุ้ง, จงซาน",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ge",
    "type": "nation",
    "code": "GE",
    "name": "GEORGIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gf",
    "type": "nation",
    "code": "GF",
    "name": "FRENCH GUIANA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gg",
    "type": "nation",
    "code": "GG",
    "name": "GUERNSEY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gh",
    "type": "nation",
    "code": "GH",
    "name": "GHANA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gi",
    "type": "nation",
    "code": "GI",
    "name": "GIBRALTAR",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gl",
    "type": "nation",
    "code": "GL",
    "name": "GREEN LAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gm",
    "type": "nation",
    "code": "GM",
    "name": "BAMBIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gn",
    "type": "nation",
    "code": "GN",
    "name": "GUINEA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gow",
    "type": "nation",
    "code": "GOW",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gp",
    "type": "nation",
    "code": "GP",
    "name": "GUADELOUPE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gq",
    "type": "nation",
    "code": "GQ",
    "name": "EQUATORIAL GUINEA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gr",
    "type": "nation",
    "code": "GR",
    "name": "GREECE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-grs",
    "type": "nation",
    "code": "GRS",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gs",
    "type": "nation",
    "code": "GS",
    "name": "SOUTH GEORGIA & SOUTH SANDWICH ISLA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gst",
    "type": "nation",
    "code": "GST",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gt",
    "type": "nation",
    "code": "GT",
    "name": "GUATEMALA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gu",
    "type": "nation",
    "code": "GU",
    "name": "GUAM",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gw",
    "type": "nation",
    "code": "GW",
    "name": "GUINEA-BISSAU",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-gy",
    "type": "nation",
    "code": "GY",
    "name": "GUYANA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-hg",
    "type": "nation",
    "code": "HG",
    "name": "HUNGARY",
    "secondaryName": "ฮังการี",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-hk",
    "type": "nation",
    "code": "HK",
    "name": "HONG KONG",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-hm",
    "type": "nation",
    "code": "HM",
    "name": "HEARD ISLAND AND MCDONALD ISLAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-hn",
    "type": "nation",
    "code": "HN",
    "name": "HONDURAS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-hr",
    "type": "nation",
    "code": "HR",
    "name": "CROATIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ht",
    "type": "nation",
    "code": "HT",
    "name": "AHITI",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-id",
    "type": "nation",
    "code": "ID",
    "name": "INDONESIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ie",
    "type": "nation",
    "code": "IE",
    "name": "IRELAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-il",
    "type": "nation",
    "code": "IL",
    "name": "ISRAEL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-im",
    "type": "nation",
    "code": "IM",
    "name": "ISLE OF MAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ind",
    "type": "nation",
    "code": "IND",
    "name": "INDIA",
    "secondaryName": "อินเดีย",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-io",
    "type": "nation",
    "code": "IO",
    "name": "BRITISH INDIAN OCEAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-iq",
    "type": "nation",
    "code": "IQ",
    "name": "IRAQ",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ir",
    "type": "nation",
    "code": "IR",
    "name": "IRAN,ISLAMIC REPUBLIC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-is",
    "type": "nation",
    "code": "IS",
    "name": "ICELAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-it",
    "type": "nation",
    "code": "IT",
    "name": "ITALY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-je",
    "type": "nation",
    "code": "JE",
    "name": "JERSEY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-jet",
    "type": "nation",
    "code": "JET",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-jm",
    "type": "nation",
    "code": "JM",
    "name": "JAMAICA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-jo",
    "type": "nation",
    "code": "JO",
    "name": "JORDAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-jp",
    "type": "nation",
    "code": "JP",
    "name": "JAPAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ke",
    "type": "nation",
    "code": "KE",
    "name": "KENYA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-kg",
    "type": "nation",
    "code": "KG",
    "name": "KYRGYZSTAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-kh",
    "type": "nation",
    "code": "KH",
    "name": "CAMBODIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ki",
    "type": "nation",
    "code": "KI",
    "name": "KIRIBATI",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-km",
    "type": "nation",
    "code": "KM",
    "name": "COMOROS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-kn",
    "type": "nation",
    "code": "KN",
    "name": "SAINT KITTS AND NEVIS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-kor",
    "type": "nation",
    "code": "KOR",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-kp",
    "type": "nation",
    "code": "KP",
    "name": "KOREA,DEMOCRATIC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-kr",
    "type": "nation",
    "code": "KR",
    "name": "KOREA REPUBLIC",
    "secondaryName": "เกาหลี",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-kw",
    "type": "nation",
    "code": "KW",
    "name": "KUWAIT",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ky",
    "type": "nation",
    "code": "KY",
    "name": "CAYMAN ISLANDS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-kz",
    "type": "nation",
    "code": "KZ",
    "name": "KAZAKHSTAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-la",
    "type": "nation",
    "code": "LA",
    "name": "LAO PEOPLE'S DEMOCRATIC REBUBLIC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-lb",
    "type": "nation",
    "code": "LB",
    "name": "LEBANON",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-lc",
    "type": "nation",
    "code": "LC",
    "name": "SAINT LUCIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-li",
    "type": "nation",
    "code": "LI",
    "name": "LIECHTENSTEIN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-lk",
    "type": "nation",
    "code": "LK",
    "name": "SRI LANKA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-lr",
    "type": "nation",
    "code": "LR",
    "name": "LIBERIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ls",
    "type": "nation",
    "code": "LS",
    "name": "LESOTHO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-lt",
    "type": "nation",
    "code": "LT",
    "name": "LITHUANIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-lu",
    "type": "nation",
    "code": "LU",
    "name": "LUXEMBOURG",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-lv",
    "type": "nation",
    "code": "LV",
    "name": "LATVIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-lxrpk",
    "type": "nation",
    "code": "LXRPK",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ly",
    "type": "nation",
    "code": "LY",
    "name": "LIBYAN ARAB JAMAHIRIYA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mc",
    "type": "nation",
    "code": "MC",
    "name": "MOROCCO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-md",
    "type": "nation",
    "code": "MD",
    "name": "MOLDOVA'REPUBLIC OF",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-me",
    "type": "nation",
    "code": "ME",
    "name": "MONTIENEGRO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-meg",
    "type": "nation",
    "code": "MEG",
    "name": "Middle East Asai",
    "secondaryName": "กลุ่มประเทศตะวันออกกลาง",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mf",
    "type": "nation",
    "code": "MF",
    "name": "SAINT MARTIN (FRENCH PART)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mg",
    "type": "nation",
    "code": "MG",
    "name": "MADAGASCAR",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mh",
    "type": "nation",
    "code": "MH",
    "name": "MARSHALL ISLANDS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mk",
    "type": "nation",
    "code": "MK",
    "name": "MACEDONIA'THE FORMER YUGOSLAV RE.",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ml",
    "type": "nation",
    "code": "ML",
    "name": "MALI",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mm",
    "type": "nation",
    "code": "MM",
    "name": "MYANMAR",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mn",
    "type": "nation",
    "code": "MN",
    "name": "MONGOLIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mo",
    "type": "nation",
    "code": "MO",
    "name": "MACAO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mp",
    "type": "nation",
    "code": "MP",
    "name": "NORTHERN MARIANA ISLANDS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mq",
    "type": "nation",
    "code": "MQ",
    "name": "MARTINIQUE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mr",
    "type": "nation",
    "code": "MR",
    "name": "MAURITANIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ms",
    "type": "nation",
    "code": "MS",
    "name": "MONTSERRAT",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mt",
    "type": "nation",
    "code": "MT",
    "name": "MALTA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mu",
    "type": "nation",
    "code": "MU",
    "name": "MAURITIUS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mv",
    "type": "nation",
    "code": "MV",
    "name": "VALDIVES",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mw",
    "type": "nation",
    "code": "MW",
    "name": "MALAWI",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mx",
    "type": "nation",
    "code": "MX",
    "name": "MEXICO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-my",
    "type": "nation",
    "code": "MY",
    "name": "MALAYSIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-mz",
    "type": "nation",
    "code": "MZ",
    "name": "MOZAMBIQUE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-na",
    "type": "nation",
    "code": "NA",
    "name": "NAMIBIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-nc",
    "type": "nation",
    "code": "NC",
    "name": "NEW CALEDONIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ne",
    "type": "nation",
    "code": "NE",
    "name": "NIGER",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-nf",
    "type": "nation",
    "code": "NF",
    "name": "NORFOLK ISLAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ng",
    "type": "nation",
    "code": "NG",
    "name": "NIGERIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ni",
    "type": "nation",
    "code": "NI",
    "name": "NICARAGUA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-nl",
    "type": "nation",
    "code": "NL",
    "name": "NETHERLANDS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-no",
    "type": "nation",
    "code": "NO",
    "name": "No Nation",
    "secondaryName": "ไม่ระบุชนชาติ",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-none",
    "type": "nation",
    "code": "NONE",
    "name": "No Nation",
    "secondaryName": "ไม่ระบุชนชาติ",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-np",
    "type": "nation",
    "code": "NP",
    "name": "NEPAL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-nr",
    "type": "nation",
    "code": "NR",
    "name": "NAURU",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-nu",
    "type": "nation",
    "code": "NU",
    "name": "NIUE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-nz",
    "type": "nation",
    "code": "NZ",
    "name": "NEW ZEALAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-om",
    "type": "nation",
    "code": "OM",
    "name": "OMAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-orc",
    "type": "nation",
    "code": "ORC",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pa",
    "type": "nation",
    "code": "PA",
    "name": "PANAMA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pe",
    "type": "nation",
    "code": "PE",
    "name": "PERU",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pf",
    "type": "nation",
    "code": "PF",
    "name": "FRENCH POLYNESIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pg",
    "type": "nation",
    "code": "PG",
    "name": "PAPUA NEW GUINEA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ph",
    "type": "nation",
    "code": "PH",
    "name": "PHILIPPINES",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pk",
    "type": "nation",
    "code": "PK",
    "name": "PAKISTAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pl",
    "type": "nation",
    "code": "PL",
    "name": "POLAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pm",
    "type": "nation",
    "code": "PM",
    "name": "SAINT PIERRE AND MIQUELON",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pn",
    "type": "nation",
    "code": "PN",
    "name": "PITCAIRN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pr",
    "type": "nation",
    "code": "PR",
    "name": "PUERTO RICO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ps",
    "type": "nation",
    "code": "PS",
    "name": "PALESTINIAN TERRITORY'OCCUPIED",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pt",
    "type": "nation",
    "code": "PT",
    "name": "PORTUGAL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pus",
    "type": "nation",
    "code": "PUS",
    "name": "PH-USA",
    "secondaryName": "พิลิปปินส์ในเอมริกา",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pv",
    "type": "nation",
    "code": "PV",
    "name": "PRIVATE",
    "secondaryName": "PRIVATE",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-pw",
    "type": "nation",
    "code": "PW",
    "name": "PALAU",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-py",
    "type": "nation",
    "code": "PY",
    "name": "PARAGUAY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-qa",
    "type": "nation",
    "code": "QA",
    "name": "QATAR",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-re",
    "type": "nation",
    "code": "RE",
    "name": "REUNION",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ro",
    "type": "nation",
    "code": "RO",
    "name": "ROMANIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ru",
    "type": "nation",
    "code": "RU",
    "name": "RUSSIAN FEDERATION",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-rw",
    "type": "nation",
    "code": "RW",
    "name": "RWANDA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sa",
    "type": "nation",
    "code": "SA",
    "name": "SAUDI ARABIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sb",
    "type": "nation",
    "code": "SB",
    "name": "SERBIA",
    "secondaryName": "เซอเบีย",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sc",
    "type": "nation",
    "code": "SC",
    "name": "SICHUAN      (SEYCHELLES)",
    "secondaryName": "ซื่อชวน",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sd",
    "type": "nation",
    "code": "SD",
    "name": "SUDAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-se",
    "type": "nation",
    "code": "SE",
    "name": "SWEDEN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sg",
    "type": "nation",
    "code": "SG",
    "name": "SINGAPORE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sh",
    "type": "nation",
    "code": "SH",
    "name": "SAINT HELENA ASCENSION",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-si",
    "type": "nation",
    "code": "SI",
    "name": "SLOVENIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sj",
    "type": "nation",
    "code": "SJ",
    "name": "SVALBARD AND JAN MAYEN SWAZILAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sk",
    "type": "nation",
    "code": "SK",
    "name": "SLOVAKIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sl",
    "type": "nation",
    "code": "SL",
    "name": "SIERRA LEONE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sm",
    "type": "nation",
    "code": "SM",
    "name": "SAN MARINO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sn",
    "type": "nation",
    "code": "SN",
    "name": "SENEGAL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-so",
    "type": "nation",
    "code": "SO",
    "name": "SOMALIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sr",
    "type": "nation",
    "code": "SR",
    "name": "SURINAME",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ss",
    "type": "nation",
    "code": "SS",
    "name": "SOUTH SUDAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-st",
    "type": "nation",
    "code": "ST",
    "name": "SAO TOME AND PRINCIPE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-stl",
    "type": "nation",
    "code": "STL",
    "name": "-",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sv",
    "type": "nation",
    "code": "SV",
    "name": "EL SALVADOR",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sx",
    "type": "nation",
    "code": "SX",
    "name": "SINT MAARTEN (DUTCH PART)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sy",
    "type": "nation",
    "code": "SY",
    "name": "SYRIAN ARAB REPUBLIC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-sz",
    "type": "nation",
    "code": "SZ",
    "name": "SCOTLAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ta",
    "type": "nation",
    "code": "TA",
    "name": "TAXI CHINA / KOREA",
    "secondaryName": "แท็กซี่-จีน/เกาหลี",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-taxi",
    "type": "nation",
    "code": "TAXI",
    "name": "TAXI",
    "secondaryName": "TAXI",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tc",
    "type": "nation",
    "code": "TC",
    "name": "TURKS AND CAICOS ISLANDS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-td",
    "type": "nation",
    "code": "TD",
    "name": "CHAD",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tf",
    "type": "nation",
    "code": "TF",
    "name": "FRENCH SOUTHERN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tg",
    "type": "nation",
    "code": "TG",
    "name": "TOGO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-th",
    "type": "nation",
    "code": "TH",
    "name": "THAILAND",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tj",
    "type": "nation",
    "code": "TJ",
    "name": "TAJIKISTAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tk",
    "type": "nation",
    "code": "TK",
    "name": "TOKELAU",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tl",
    "type": "nation",
    "code": "TL",
    "name": "TIMOR-LESTE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tm",
    "type": "nation",
    "code": "TM",
    "name": "TURKMENISTAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tn",
    "type": "nation",
    "code": "TN",
    "name": "TUNISIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-to",
    "type": "nation",
    "code": "TO",
    "name": "TONGA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tpc",
    "type": "nation",
    "code": "TPC",
    "name": "TOURIST PLUS CARD",
    "secondaryName": "TOURIST PLUS CARD",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tr",
    "type": "nation",
    "code": "TR",
    "name": "TURKEY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tt",
    "type": "nation",
    "code": "TT",
    "name": "TRINIDAD AND TOBAGO",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tus",
    "type": "nation",
    "code": "TUS",
    "name": "T-IN-USA",
    "secondaryName": "ไตหวันในอเมริกา",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tv",
    "type": "nation",
    "code": "TV",
    "name": "TUVALU",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tw",
    "type": "nation",
    "code": "TW",
    "name": "TAIWAN",
    "secondaryName": "ประเทศไตหวัน",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-tz",
    "type": "nation",
    "code": "TZ",
    "name": "TANZANIA'UNITED REPUBLIC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ua",
    "type": "nation",
    "code": "UA",
    "name": "UKRAINE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ug",
    "type": "nation",
    "code": "UG",
    "name": "UGANDA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-um",
    "type": "nation",
    "code": "UM",
    "name": "UNITED STATES MINOR",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-us",
    "type": "nation",
    "code": "US",
    "name": "USA",
    "secondaryName": "อเมริกา",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-us1",
    "type": "nation",
    "code": "US1",
    "name": "CHINA-US1",
    "secondaryName": "จีนในยุโรป คุณวิเชียร",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-us2",
    "type": "nation",
    "code": "US2",
    "name": "CHINA-US2",
    "secondaryName": "จีนในยุโรป Ms. Yang",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-uy",
    "type": "nation",
    "code": "UY",
    "name": "URUGUAY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-uz",
    "type": "nation",
    "code": "UZ",
    "name": "UZBEKISTAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-va",
    "type": "nation",
    "code": "VA",
    "name": "HOLY SEE (VATICAN CITY STATE)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-vas",
    "type": "nation",
    "code": "VAS",
    "name": "VN-AUS",
    "secondaryName": "เวียดนามในออสเตรเลีย",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-vc",
    "type": "nation",
    "code": "VC",
    "name": "SAINT VINCENT AND GRENADINES",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ve",
    "type": "nation",
    "code": "VE",
    "name": "VENEZUELA'BOLIVARIAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-vg",
    "type": "nation",
    "code": "VG",
    "name": "VIRGIN ISLAND'BRITISH",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-vi",
    "type": "nation",
    "code": "VI",
    "name": "VIRGIN ISLANDS'US.",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-vn",
    "type": "nation",
    "code": "VN",
    "name": "VIET NAM",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-vu",
    "type": "nation",
    "code": "VU",
    "name": "VANUATU",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-vus",
    "type": "nation",
    "code": "VUS",
    "name": "V-IN-USA",
    "secondaryName": "เวียดนามในอเมริกา",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-wait",
    "type": "nation",
    "code": "WAIT",
    "name": "WAIT",
    "secondaryName": "WAIT",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-wf",
    "type": "nation",
    "code": "WF",
    "name": "WALLIS AND FUTUNA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-wi",
    "type": "nation",
    "code": "WI",
    "name": "WALK IN",
    "secondaryName": "WALK IN",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ww",
    "type": "nation",
    "code": "WW",
    "name": "WORLD WIDE",
    "secondaryName": "ทั่วไป",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-ye",
    "type": "nation",
    "code": "YE",
    "name": "YEMAN",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-yn",
    "type": "nation",
    "code": "YN",
    "name": "YUNNAN",
    "secondaryName": "ยูนาน",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-yt",
    "type": "nation",
    "code": "YT",
    "name": "MAYOTTE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-za",
    "type": "nation",
    "code": "ZA",
    "name": "SOUTH AFRICA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-zm",
    "type": "nation",
    "code": "ZM",
    "name": "ZAMBIA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-zw",
    "type": "nation",
    "code": "ZW",
    "name": "ZIMBABWE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-nation-zx",
    "type": "nation",
    "code": "ZX",
    "name": "No Nation",
    "secondaryName": "ไม่ระบุชนชาติ",
    "nationCode": ""
  },
  {
    "id": "fallback-province-bd-bangladesh",
    "type": "province",
    "code": "BANGLADESH",
    "name": "บังคลาเทศ",
    "secondaryName": "BANGLADESH",
    "nationCode": "BD"
  },
  {
    "id": "fallback-province-cfr-china-fr",
    "type": "province",
    "code": "CHINA-FR",
    "name": "จีนในฝรั่งเศษ",
    "secondaryName": "CHINA-FR",
    "nationCode": "CFR"
  },
  {
    "id": "fallback-province-cn-anhui",
    "type": "province",
    "code": "ANHUI",
    "name": "อานฮุย/เหอเฟย์",
    "secondaryName": "ANHUI",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-beijing",
    "type": "province",
    "code": "BEIJING",
    "name": "ปักกิ่ง (เป่ยจิง)",
    "secondaryName": "BEIJING",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-china",
    "type": "province",
    "code": "CHINA",
    "name": "จีน",
    "secondaryName": "CHINA",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-chongqing",
    "type": "province",
    "code": "CHONGQING",
    "name": "ฉงฉิ่ง",
    "secondaryName": "CHONGQING",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctcct",
    "type": "province",
    "code": "CTCCT",
    "name": "ชาเตอร์ CCT",
    "secondaryName": "CTCCT",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctclv",
    "type": "province",
    "code": "CTCLV",
    "name": "ชาร์เตอร์หลงไท่",
    "secondaryName": "CTCLV",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctgb",
    "type": "province",
    "code": "CTGB",
    "name": "ชาเตอร์โกลบอล",
    "secondaryName": "CTGB",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctllt",
    "type": "province",
    "code": "CTLLT",
    "name": "ชาร์เตอร์LIAN TAI ( LLT )",
    "secondaryName": "CTLLT",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctlltc",
    "type": "province",
    "code": "CTLLTC",
    "name": "ชาเตอร์ LLTC",
    "secondaryName": "CTLLTC",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctlt",
    "type": "province",
    "code": "CTLT",
    "name": "ชาร์เตอร์เหลียนไท่ (LT)",
    "secondaryName": "CTLT",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctlt-2",
    "type": "province",
    "code": "CTLT-2",
    "name": "ชาร์เตอร์เหลียนไท่ ( 2 )",
    "secondaryName": "CTLT-2",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctlth",
    "type": "province",
    "code": "CTLTH",
    "name": "ชาเตอร์เหลียนไท่ (HONGTHAI)",
    "secondaryName": "CTLTH",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctltp",
    "type": "province",
    "code": "CTLTP",
    "name": "ชาเตอร์ LTP(THAI HONG DA)",
    "secondaryName": "CTLTP",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctlts",
    "type": "province",
    "code": "CTLTS",
    "name": "ชาร์เตอร์LIAN TAI ( LTS )",
    "secondaryName": "CTLTS",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctlv",
    "type": "province",
    "code": "CTLV",
    "name": "ชาร์เตอร์หลงไท่",
    "secondaryName": "CTLV",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctlx",
    "type": "province",
    "code": "CTLX",
    "name": "ชาเตอร์หลงเถิง",
    "secondaryName": "CTLX",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctlxwy",
    "type": "province",
    "code": "CTLXWY",
    "name": "ชาเตอร์หลงเถิง WY",
    "secondaryName": "CTLXWY",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctmjtx",
    "type": "province",
    "code": "CTMJTX",
    "name": "ชาร์เตอร์เหม่ยจิงเทียนเซี้ย",
    "secondaryName": "CTMJTX",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctoct",
    "type": "province",
    "code": "CTOCT",
    "name": "ชาเตอร์โอเวอร์ซีร์",
    "secondaryName": "CTOCT",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctpd",
    "type": "province",
    "code": "CTPD",
    "name": "ชาเตอร์ พิมดี",
    "secondaryName": "CTPD",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-cttfh",
    "type": "province",
    "code": "CTTFH",
    "name": "ชาเตอร์ตงฟางฮอลิเดย์",
    "secondaryName": "CTTFH",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-cttjy",
    "type": "province",
    "code": "CTTJY",
    "name": "ชาเตอร์ จิวหยุ่น TJY",
    "secondaryName": "CTTJY",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-cttkl",
    "type": "province",
    "code": "CTTKL",
    "name": "ชาเตอร์ ทีเคแอล",
    "secondaryName": "CTTKL",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-cttkl-1",
    "type": "province",
    "code": "CTTKL-1",
    "name": "ชาเตอร์ทีเคแอล1",
    "secondaryName": "CTTKL-1",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-cttng",
    "type": "province",
    "code": "CTTNG",
    "name": "ชาเตอร์ทีเอ็นจี",
    "secondaryName": "CTTNG",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctttx",
    "type": "province",
    "code": "CTTTX",
    "name": "ชาเตอร์ไทยเทียนซุ่น",
    "secondaryName": "CTTTX",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-cttxw",
    "type": "province",
    "code": "CTTXW",
    "name": "ชาเตอร์ ไทซิงว่าง",
    "secondaryName": "CTTXW",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctxd",
    "type": "province",
    "code": "CTXD",
    "name": "ชาเตอร์ ซินต๋า",
    "secondaryName": "CTXD",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ctym",
    "type": "province",
    "code": "CTYM",
    "name": "ชาเตอร์ยูเหม่ย",
    "secondaryName": "CTYM",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-fujian",
    "type": "province",
    "code": "FUJIAN",
    "name": "ฝู๋เจี้ยน (ฮกเกี้ยน)/ฝูโจว",
    "secondaryName": "FUJIAN",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-gansu",
    "type": "province",
    "code": "GANSU",
    "name": "การซู (หลานโจว)",
    "secondaryName": "GANSU",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-guangdong",
    "type": "province",
    "code": "GUANGDONG",
    "name": "กวางตุ้ง/กวางโจว/ซ่านโถว/เซินเจิ้น/จงซาน",
    "secondaryName": "GUANGDONG",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-guangxi",
    "type": "province",
    "code": "GUANGXI",
    "name": "กว่างซี/หนานหนิง/กุ้ยหลิน",
    "secondaryName": "GUANGXI",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-guizhou",
    "type": "province",
    "code": "GUIZHOU",
    "name": "กุ้ยโจว (กุ้ยหยาง)",
    "secondaryName": "GUIZHOU",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-hainan",
    "type": "province",
    "code": "HAINAN",
    "name": "ไห่หนาน (ไหหลำ)/ไหโข่ว",
    "secondaryName": "HAINAN",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-hebei",
    "type": "province",
    "code": "HEBEI",
    "name": "เหอเป่ย (ฉือเจียจวง)",
    "secondaryName": "HEBEI",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-heilongjiang",
    "type": "province",
    "code": "HEILONGJIANG",
    "name": "เฮยหลงเจียง/ฮาร์บิน",
    "secondaryName": "HEILONGJIANG",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-henan",
    "type": "province",
    "code": "HENAN",
    "name": "เหอหนาน/เจิ้งโจว",
    "secondaryName": "HENAN",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-hubei",
    "type": "province",
    "code": "HUBEI",
    "name": "หูเป่ย/อู่ฮั่น",
    "secondaryName": "HUBEI",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-hunan",
    "type": "province",
    "code": "HUNAN",
    "name": "หูหนาน (ฉางชา)",
    "secondaryName": "HUNAN",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-jiangsu",
    "type": "province",
    "code": "JIANGSU",
    "name": "เจียงซู/หนานจิง(นานกิง)/ซูโจว",
    "secondaryName": "JIANGSU",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-jiangxi",
    "type": "province",
    "code": "JIANGXI",
    "name": "เจียงซี/หนานฉาง",
    "secondaryName": "JIANGXI",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-jilin",
    "type": "province",
    "code": "JILIN",
    "name": "จี้หลิง/ฉางชุน",
    "secondaryName": "JILIN",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-liaoning",
    "type": "province",
    "code": "LIAONING",
    "name": "เหลียวหนิง/เสิ่นหยาง/ต้าเหลียน",
    "secondaryName": "LIAONING",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-llts",
    "type": "province",
    "code": "LLTS",
    "name": "ชาเตอร์ LLTS",
    "secondaryName": "LLTS",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-mgl",
    "type": "province",
    "code": "MGL",
    "name": "มองโกเลีย",
    "secondaryName": "MONGOLIA",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-neimenggu",
    "type": "province",
    "code": "NEIMENGGU",
    "name": "เน่ย์เหมิงกู่",
    "secondaryName": "NEIMENGGU",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-ningxia",
    "type": "province",
    "code": "NINGXIA",
    "name": "หนิงเซี้ย",
    "secondaryName": "NINGXIA",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-other-china",
    "type": "province",
    "code": "OTHER CHINA",
    "name": "จีนอื่นๆ",
    "secondaryName": "OTHER CHINA",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-qinghai",
    "type": "province",
    "code": "QINGHAI",
    "name": "ชิงไห่ (ซีหนิง)",
    "secondaryName": "QINGHAI",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-shaanxi",
    "type": "province",
    "code": "SHAANXI",
    "name": "ส่านซี (ซีอาน)",
    "secondaryName": "SHAANXI",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-shandong",
    "type": "province",
    "code": "SHANDONG",
    "name": "ซานตง /จีหนาน /เยี่ยนไถ",
    "secondaryName": "SHANDONG",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-shanghai",
    "type": "province",
    "code": "SHANGHAI",
    "name": "เซียงไฮ้",
    "secondaryName": "SHANGHAI",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-shanxi",
    "type": "province",
    "code": "SHANXI",
    "name": "ซานซี (ไท่หยวน)",
    "secondaryName": "SHANXI",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-sichuan",
    "type": "province",
    "code": "SICHUAN",
    "name": "ซื่อชวน(เสฉวน)/เฉิงตู (เฉินตู)",
    "secondaryName": "SICHUAN",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-tianjin",
    "type": "province",
    "code": "TIANJIN",
    "name": "เทียนจิง",
    "secondaryName": "TIANJIN",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-wu-han",
    "type": "province",
    "code": "WU HAN",
    "name": "อู่ฮัน",
    "secondaryName": "WU HAN",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-xinjiang",
    "type": "province",
    "code": "XINJIANG",
    "name": "ซินเจียง",
    "secondaryName": "XINJIANG",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-xizhang",
    "type": "province",
    "code": "XIZHANG",
    "name": "ซีจ้าง",
    "secondaryName": "XIZHANG",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-yunnan",
    "type": "province",
    "code": "YUNNAN",
    "name": "หยุนหนาน(ยูนนาน)/คุนหมิง",
    "secondaryName": "YUNNAN",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-zhang-zhou",
    "type": "province",
    "code": "ZHANG ZHOU",
    "name": "จางโจว",
    "secondaryName": "ZHANG ZHOU",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cn-zhejiang",
    "type": "province",
    "code": "ZHEJIANG",
    "name": "เจ้อเจียง (หังโจว) / หนิงโป",
    "secondaryName": "ZHEJIANG",
    "nationCode": "CN"
  },
  {
    "id": "fallback-province-cnl-ch-new-zeland",
    "type": "province",
    "code": "CH-NEW ZELAND",
    "name": "จีนในนิวซีแลนด์",
    "secondaryName": "CH-New Zeland",
    "nationCode": "CNL"
  },
  {
    "id": "fallback-province-cus-china-in-usa",
    "type": "province",
    "code": "CHINA IN USA",
    "name": "จีนในอเมริกา",
    "secondaryName": "CHINA IN USA",
    "nationCode": "CUS"
  },
  {
    "id": "fallback-province-cvn-china-in-vietnam",
    "type": "province",
    "code": "CHINA IN VIETNAM",
    "name": "จีนในเวียดนาม",
    "secondaryName": "CHINA IN VIETNAM",
    "nationCode": "CVN"
  },
  {
    "id": "fallback-province-eu-europe",
    "type": "province",
    "code": "EUROPE",
    "name": "ยุโรป",
    "secondaryName": "EUROPE",
    "nationCode": "EU"
  },
  {
    "id": "fallback-province-eu-other-europe",
    "type": "province",
    "code": "OTHER EUROPE",
    "name": "ยุโรปรวม",
    "secondaryName": "OTHER EUROPE",
    "nationCode": "EU"
  },
  {
    "id": "fallback-province-eu-usa",
    "type": "province",
    "code": "USA",
    "name": "อเมริกา",
    "secondaryName": "อเมริกา",
    "nationCode": "EU"
  },
  {
    "id": "fallback-province-fr-france",
    "type": "province",
    "code": "FRANCE",
    "name": "ประเทศฝรั่งเศส",
    "secondaryName": "FRANCE",
    "nationCode": "FR"
  },
  {
    "id": "fallback-province-fus-france-usa",
    "type": "province",
    "code": "FRANCE-USA",
    "name": "ฝรั่งเศสในอเมริกา",
    "secondaryName": "FRANCE-USA",
    "nationCode": "FUS"
  },
  {
    "id": "fallback-province-hg-hungary",
    "type": "province",
    "code": "HUNGARY",
    "name": "อังการี",
    "secondaryName": "HUNGARY",
    "nationCode": "HG"
  },
  {
    "id": "fallback-province-hk-hongkong",
    "type": "province",
    "code": "HONGKONG",
    "name": "ฮ่องกง",
    "secondaryName": "HONGKONG",
    "nationCode": "HK"
  },
  {
    "id": "fallback-province-id-indonesia",
    "type": "province",
    "code": "INDONESIA",
    "name": "อินโดนีเซีย",
    "secondaryName": "INDONESIA",
    "nationCode": "ID"
  },
  {
    "id": "fallback-province-ind-india",
    "type": "province",
    "code": "INDIA",
    "name": "อินเดีย",
    "secondaryName": "INDIA",
    "nationCode": "IND"
  },
  {
    "id": "fallback-province-ir-iran",
    "type": "province",
    "code": "IRAN",
    "name": "อิหร่าน",
    "secondaryName": "IRAN",
    "nationCode": "IR"
  },
  {
    "id": "fallback-province-jp-japan",
    "type": "province",
    "code": "JAPAN",
    "name": "ญี่ปุ่น",
    "secondaryName": "JAPAN",
    "nationCode": "JP"
  },
  {
    "id": "fallback-province-kr-korea",
    "type": "province",
    "code": "KOREA",
    "name": "เกาหลี",
    "secondaryName": "KOREA",
    "nationCode": "KR"
  },
  {
    "id": "fallback-province-la-laos",
    "type": "province",
    "code": "LAOS",
    "name": "ลาว",
    "secondaryName": "LAOS",
    "nationCode": "LA"
  },
  {
    "id": "fallback-province-mc-morocco",
    "type": "province",
    "code": "MOROCCO",
    "name": "โมร็อกโก",
    "secondaryName": "MOROCCO",
    "nationCode": "MC"
  },
  {
    "id": "fallback-province-mm-myanmar",
    "type": "province",
    "code": "MYANMAR",
    "name": "พม่า",
    "secondaryName": "MYANMAR",
    "nationCode": "MM"
  },
  {
    "id": "fallback-province-mn-mn",
    "type": "province",
    "code": "MN",
    "name": "มองโกเลีย",
    "secondaryName": "MONGOLIA",
    "nationCode": "MN"
  },
  {
    "id": "fallback-province-my-malaysia",
    "type": "province",
    "code": "MALAYSIA",
    "name": "มาเลเซีย",
    "secondaryName": "MALAYSIA",
    "nationCode": "MY"
  },
  {
    "id": "fallback-province-no",
    "type": "province",
    "code": "ไม่รู้มณฑล",
    "name": "ไม่รู้มณฑล",
    "secondaryName": "ไม่รู้มณฑล",
    "nationCode": "NO"
  },
  {
    "id": "fallback-province-ph-philippines",
    "type": "province",
    "code": "PHILIPPINES",
    "name": "พิลิปปินส์",
    "secondaryName": "PHILIPPINES",
    "nationCode": "PH"
  },
  {
    "id": "fallback-province-pus-ph-usa",
    "type": "province",
    "code": "PH-USA",
    "name": "พิลิปนส์ในเอเมริกา",
    "secondaryName": "PH-USA",
    "nationCode": "PUS"
  },
  {
    "id": "fallback-province-pv-private",
    "type": "province",
    "code": "PRIVATE",
    "name": "PRIVATE",
    "secondaryName": "PRIVATE",
    "nationCode": "PV"
  },
  {
    "id": "fallback-province-ru-russia",
    "type": "province",
    "code": "RUSSIA",
    "name": "รัสเซีย",
    "secondaryName": "RUSSIA",
    "nationCode": "RU"
  },
  {
    "id": "fallback-province-sy-syrian-arab-republ",
    "type": "province",
    "code": "SYRIAN ARAB REPUBL",
    "name": "SYRIAN ARAB REPUBL",
    "secondaryName": "SYRIAN ARAB REPUBL",
    "nationCode": "SY"
  },
  {
    "id": "fallback-province-taxi-taxi",
    "type": "province",
    "code": "TAXI",
    "name": "TAXI",
    "secondaryName": "TAXI",
    "nationCode": "TAXI"
  },
  {
    "id": "fallback-province-tpc-tourist-plus-card",
    "type": "province",
    "code": "TOURIST PLUS CARD",
    "name": "TOURIST PLUS CARD",
    "secondaryName": "TOURIST PLUS CARD",
    "nationCode": "TPC"
  },
  {
    "id": "fallback-province-tr-turky",
    "type": "province",
    "code": "TURKY",
    "name": "ตุรกี",
    "secondaryName": "TURKY",
    "nationCode": "TR"
  },
  {
    "id": "fallback-province-tw-taiwan",
    "type": "province",
    "code": "TAIWAN",
    "name": "ไตหวัน",
    "secondaryName": "TAIWAN",
    "nationCode": "TW"
  },
  {
    "id": "fallback-province-tw-to",
    "type": "province",
    "code": "TO",
    "name": "ไต้หวันอื่นๆ",
    "secondaryName": "OTHER TAIWAN",
    "nationCode": "TW"
  },
  {
    "id": "fallback-province-us-china-us",
    "type": "province",
    "code": "CHINA-US",
    "name": "จีนในอเมริกา",
    "secondaryName": "CHINA-US",
    "nationCode": "US"
  },
  {
    "id": "fallback-province-us1-china-us1",
    "type": "province",
    "code": "CHINA-US1",
    "name": "จีนในยุโรป คุณวิเชียร",
    "secondaryName": "CHINA-US1",
    "nationCode": "US1"
  },
  {
    "id": "fallback-province-us2-china-us2",
    "type": "province",
    "code": "CHINA-US2",
    "name": "จีนในยุโรป Ms. Yang",
    "secondaryName": "CHINA-US2",
    "nationCode": "US2"
  },
  {
    "id": "fallback-province-vas-vn-aus",
    "type": "province",
    "code": "VN-AUS",
    "name": "เวียดนามในออสเตรเลีย",
    "secondaryName": "VN-AUS",
    "nationCode": "VAS"
  },
  {
    "id": "fallback-province-vn-vietnam",
    "type": "province",
    "code": "VIETNAM",
    "name": "เวียดนาม",
    "secondaryName": "VIETNAM",
    "nationCode": "VN"
  },
  {
    "id": "fallback-province-vus-v-in-usa",
    "type": "province",
    "code": "V-IN-USA",
    "name": "เวียดนามในอเมริกา",
    "secondaryName": "V-IN-USA",
    "nationCode": "VUS"
  },
  {
    "id": "fallback-province-wait-wait",
    "type": "province",
    "code": "WAIT",
    "name": "WAIT",
    "secondaryName": "WAIT",
    "nationCode": "WAIT"
  },
  {
    "id": "fallback-province-wi-walk-in",
    "type": "province",
    "code": "WALK IN",
    "name": "WALK IN",
    "secondaryName": "WALK IN",
    "nationCode": "WI"
  },
  {
    "id": "fallback-bustype-busagent",
    "type": "busType",
    "code": "BUSAGENT",
    "name": "BUS AGENT",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-bustype-busoa",
    "type": "busType",
    "code": "BUSOA",
    "name": "BUS OA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-bustype-minibus",
    "type": "busType",
    "code": "MINIBUS",
    "name": "MINI BUS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-bustype-taxi",
    "type": "busType",
    "code": "TAXI",
    "name": "TAXI / LIMOUSINE",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-bustype-vanagent",
    "type": "busType",
    "code": "VANAGENT",
    "name": "VAN AGENT",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-bustype-vanoa",
    "type": "busType",
    "code": "VANOA",
    "name": "VAN OA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctait",
    "type": "charterCode",
    "code": "CTAIT",
    "name": "ชาร์เตอร์ AIT",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctcgb",
    "type": "charterCode",
    "code": "CTCGB",
    "name": "ชาร์เตอร์โกลบอล",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctcnlv",
    "type": "charterCode",
    "code": "CTCNLV",
    "name": "ชาร์เตอร์ นิวหลงไท่ CNLV",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctcxzyw",
    "type": "charterCode",
    "code": "CTCXZYW",
    "name": "ชาร์เตอร์ซูจิง",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctds",
    "type": "charterCode",
    "code": "CTDS",
    "name": "ชาร์เตอร์ติ่งเซิ่ง",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctdxt",
    "type": "charterCode",
    "code": "CTDXT",
    "name": "ชาร์เตอร์ต้าเซี่ยง DAXIANG",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctep",
    "type": "charterCode",
    "code": "CTEP",
    "name": "CHARTER ENPRO /ชาร์เตอร์เอ็นโปร",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctep1",
    "type": "charterCode",
    "code": "CTEP1",
    "name": "CHARTER ENPRO1 /ชาร์เตอร์เอ็นโปร1",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctfy",
    "type": "charterCode",
    "code": "CTFY",
    "name": "ชาเตอร์ ฟูหยวน",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctgb",
    "type": "charterCode",
    "code": "CTGB",
    "name": "ชาเตอร์โกลบอล",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cthx",
    "type": "charterCode",
    "code": "CTHX",
    "name": "ขาเตอร์หัวชิง HX",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctjcl",
    "type": "charterCode",
    "code": "CTJCL",
    "name": "ชาร์เตอร์ เจ ซี แอล JCL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctjy",
    "type": "charterCode",
    "code": "CTJY",
    "name": "ชาร์เตอร์จิ่วหยุน JY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctjyl",
    "type": "charterCode",
    "code": "CTJYL",
    "name": "ชาร์เตอร์จินหยุน JYL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctllt",
    "type": "charterCode",
    "code": "CTLLT",
    "name": "ชาร์เตอร์LIAN TAI ( LLT )",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctllt1",
    "type": "charterCode",
    "code": "CTLLT1",
    "name": "ชาร์เตอร์เหลียนไท่ LLT1",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlltc",
    "type": "charterCode",
    "code": "CTLLTC",
    "name": "ชาเตอร์ LLTC",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctllth",
    "type": "charterCode",
    "code": "CTLLTH",
    "name": "ชาร์เตอร์ LLTH",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlltm",
    "type": "charterCode",
    "code": "CTLLTM",
    "name": "ชาร์เตอร์เหลียนไท่ LLTM",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctllts",
    "type": "charterCode",
    "code": "CTLLTS",
    "name": "ชาร์เตอร์เหลียนไท่ LLTS",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlltw",
    "type": "charterCode",
    "code": "CTLLTW",
    "name": "ชาร์เตอร์เหลียนไท่ LLTW",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlt",
    "type": "charterCode",
    "code": "CTLT",
    "name": "ชาร์เตอร์เหลียนไท่ (LT)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlt-2",
    "type": "charterCode",
    "code": "CTLT-2",
    "name": "ชาร์เตอร์เหลียนไท่ ( 2 )",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlta",
    "type": "charterCode",
    "code": "CTLTA",
    "name": "CHARTER LTA /ชาร์เตอร์ เหลียนไท่ LTA",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlth",
    "type": "charterCode",
    "code": "CTLTH",
    "name": "ชาเตอร์เหลียนไท่ (HONGTHAI)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctltj",
    "type": "charterCode",
    "code": "CTLTJ",
    "name": "ชาร์เตอร์เหลียนไท่ LTJ",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctltp",
    "type": "charterCode",
    "code": "CTLTP",
    "name": "ชาเตอร์ LTP(THAI HONG DA)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctltq",
    "type": "charterCode",
    "code": "CTLTQ",
    "name": "ชาร์เตอร์เหลียนไท  (LTQ)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlts",
    "type": "charterCode",
    "code": "CTLTS",
    "name": "ชาร์เตอร์LIAN TAI ( LTS )",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctltw",
    "type": "charterCode",
    "code": "CTLTW",
    "name": "ชาร์เตอร์เหลียนไท่ LTW",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctltx",
    "type": "charterCode",
    "code": "CTLTX",
    "name": "ชาร์เตอร์เหลียนไท่ LTX",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlv",
    "type": "charterCode",
    "code": "CTLV",
    "name": "ชาร์เตอร์หลงไท่",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlvm",
    "type": "charterCode",
    "code": "CTLVM",
    "name": "ชาร์เตอร์โคลเวอร์ LVM",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlx",
    "type": "charterCode",
    "code": "CTLX",
    "name": "ชาเตอร์หลงเถิง",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlxwl",
    "type": "charterCode",
    "code": "CTLXWL",
    "name": "ชาร์เตอร์หลงเถิง LXWL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctlxwy",
    "type": "charterCode",
    "code": "CTLXWY",
    "name": "ชาเตอร์หลงเถิง WY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctmjtx",
    "type": "charterCode",
    "code": "CTMJTX",
    "name": "ชาร์เตอร์เหม่ยจิงเทียนเซี้ย",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctmtt",
    "type": "charterCode",
    "code": "CTMTT",
    "name": "ชาร์เตอร์เมทไทย",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctnjt",
    "type": "charterCode",
    "code": "CTNJT",
    "name": "ชาร์เตอร์นิวจินไท่",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctoct",
    "type": "charterCode",
    "code": "CTOCT",
    "name": "ชาเตอร์โอเวอร์ซีร์",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctpbrx",
    "type": "charterCode",
    "code": "CTPBRX",
    "name": "ชาร์เตอร์ พีบีอาร์เอ๊กซ์",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctpd",
    "type": "charterCode",
    "code": "CTPD",
    "name": "ชาเตอร์ พิมดี",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctqh",
    "type": "charterCode",
    "code": "CTQH",
    "name": "CHARTER QINGHER ชิงเหอ",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctsim",
    "type": "charterCode",
    "code": "CTSIM",
    "name": "ชาร์เตอร์สยามอินเตอร์ SIM",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctsxd",
    "type": "charterCode",
    "code": "CTSXD",
    "name": "ชาเตอร์ ซินต๋า ( SXD )",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttcq",
    "type": "charterCode",
    "code": "CTTCQ",
    "name": "ชาเตอร์ ไทชวนฉี (TCQ)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttfh",
    "type": "charterCode",
    "code": "CTTFH",
    "name": "ชาเตอร์ตงฟางฮอลิเดย์",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttht",
    "type": "charterCode",
    "code": "CTTHT",
    "name": "ชาร์เตอร์ไท่หงต๋า TAI HONG TA TRAVEL",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttjy",
    "type": "charterCode",
    "code": "CTTJY",
    "name": "ชาเตอร์ จิวหยุ่น TJY",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttkl",
    "type": "charterCode",
    "code": "CTTKL",
    "name": "ชาเตอร์ ทีเคแอล",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttkl-1",
    "type": "charterCode",
    "code": "CTTKL-1",
    "name": "ชาเตอร์ทีเคแอล1",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttng",
    "type": "charterCode",
    "code": "CTTNG",
    "name": "ชาร์เตอร์ไทยนิวเจน",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttnox",
    "type": "charterCode",
    "code": "CTTNOX",
    "name": "ชาร์เตอร์นิวโอเชียนTNOX",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctttx",
    "type": "charterCode",
    "code": "CTTTX",
    "name": "ชาเตอร์ไทยเทียนซุ่น",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttwx",
    "type": "charterCode",
    "code": "CTTWX",
    "name": "ชาร์เตอร์ไทว่านเซียง",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttwy",
    "type": "charterCode",
    "code": "CTTWY",
    "name": "ชาร์เตอร์ไทหวังยู (TAI WANG YU)",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttxw",
    "type": "charterCode",
    "code": "CTTXW",
    "name": "ชาเตอร์ ไทซิงว่าง",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-cttzt",
    "type": "charterCode",
    "code": "CTTZT",
    "name": "ชาเตอร์ ศุภโชคดี",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctvxd",
    "type": "charterCode",
    "code": "CTVXD",
    "name": "ชาเตอร์ ซินต๋า ( VXD )",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctwg",
    "type": "charterCode",
    "code": "CTWG",
    "name": "ชาร์เตอร์วั่นกั๋ว",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctxd",
    "type": "charterCode",
    "code": "CTXD",
    "name": "ชาเตอร์ ซินต๋า",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctykl",
    "type": "charterCode",
    "code": "CTYKL",
    "name": "ชาร์เตอร์ หยางกวง",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctykl-1",
    "type": "charterCode",
    "code": "CTYKL-1",
    "name": "ชาร์เตอร์ หยางกวง1",
    "secondaryName": "",
    "nationCode": ""
  },
  {
    "id": "fallback-chartercode-ctym",
    "type": "charterCode",
    "code": "CTYM",
    "name": "ชาเตอร์ยูเหม่ย",
    "secondaryName": "",
    "nationCode": ""
  }
];

export function getFallbackReferenceItems(
  type: FallbackReferenceLookupType,
  filters: { search?: string; nationCode?: string } = {},
) {
  const needle = filters.search?.trim().toLowerCase() ?? '';
  const nationCode = filters.nationCode?.trim().toUpperCase() ?? '';
  return fallbackReferenceItems
    .filter((item) => item.type === type)
    .filter((item) => (type === 'province' && nationCode ? item.nationCode === nationCode : true))
    .filter((item) => (!needle ? true : (item.code + ' ' + item.name + ' ' + item.secondaryName + ' ' + item.nationCode).toLowerCase().includes(needle)))
    .sort((a, b) => a.code.localeCompare(b.code) || a.name.localeCompare(b.name));
}
