// Application constants
const DEFAULT_BASE_ADDRESS = '東京都千代田区九段北１丁目８−１０';
const DEFAULT_RADIUS = 3; // km

// API URLs
const SEARCH_URL = "https://msearch.gsi.go.jp/address-search/AddressSearch?q=";
const REVERSE_URL = "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lon=%s&lat=%s";
const LEN_URL = "/api/proxy/gsi-distance?latitude1=%s&longitude1=%s&latitude2=%s&longitude2=%s";
