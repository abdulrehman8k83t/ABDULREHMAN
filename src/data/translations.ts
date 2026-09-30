import { AppLanguage } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  // Nav
  navHome: string;
  navBrowser: string;
  navDownloads: string;
  navLibrary: string;
  navDiscover: string;
  navSettings: string;
  
  // Home
  pasteLinkPlaceholder: string;
  pasteFromClipboard: string;
  inspectLink: string;
  inspecting: string;
  quickSampleLinks: string;
  storageUsage: string;
  storageFree: string;
  storageUsed: string;
  continueWatching: string;
  resumedFrom: string;
  recentDownloads: string;
  noRecentDownloads: string;
  sampleDirectVideo: string;
  sampleDirectAudio: string;
  sampleDirectPdf: string;
  sampleYouTube: string;
  sampleInstagram: string;
  sampleTikTok: string;
  
  // Link Inspection & Restrictions
  restrictedPlatform: string;
  unsupportedPage: string;
  directDownloadAvailable: string;
  openInOriginalApp: string;
  openInYouTube: string;
  openInInstagram: string;
  openInTikTok: string;
  openInBrowser: string;
  complianceNoticeTitle: string;
  youTubeComplianceMsg: string;
  instagramComplianceMsg: string;
  tikTokComplianceMsg: string;
  facebookComplianceMsg: string;
  unsupportedWebMsg: string;
  
  // Download Options Sheet
  downloadOptions: string;
  saveAs: string;
  destinationFolder: string;
  selectQuality: string;
  videoFormats: string;
  audioOnly: string;
  startDownload: string;
  cancel: string;
  fileAlreadyExists: string;
  
  // Downloads Screen
  tabActive: string;
  tabQueued: string;
  tabCompleted: string;
  tabFailed: string;
  pauseAll: string;
  resumeAll: string;
  clearCompleted: string;
  emptyDownloads: string;
  emptyDownloadsDesc: string;
  speed: string;
  remaining: string;
  resumeSupported: string;
  resumeNotSupported: string;
  pause: string;
  resume: string;
  retry: string;
  delete: string;
  openFile: string;
  statusQueued: string;
  statusStarting: string;
  statusDownloading: string;
  statusPaused: string;
  statusCompleted: string;
  statusFailed: string;
  statusCancelled: string;
  
  // Library Screen
  tabAll: string;
  tabVideos: string;
  tabAudio: string;
  tabImages: string;
  tabDocuments: string;
  importMedia: string;
  emptyLibrary: string;
  emptyLibraryDesc: string;
  play: string;
  fileDetails: string;
  rename: string;
  share: string;
  confirmDelete: string;
  confirmDeleteDesc: string;
  size: string;
  duration: string;
  dateAdded: string;
  sortBy: string;
  sortDateDesc: string;
  sortDateAsc: string;
  sortNameAsc: string;
  sortSizeDesc: string;
  
  // Discover Screen
  searchPlaceholder: string;
  searchHistory: string;
  clearSearchHistory: string;
  curatedDirectResources: string;
  curatedDirectResourcesDesc: string;
  webSearchDisclaimer: string;
  noSearchResults: string;
  
  // Player
  playbackSpeed: string;
  audioTracks: string;
  volume: string;
  brightness: string;
  lockOrientation: string;
  fullscreen: string;
  exitFullscreen: string;
  pictureInPicture: string;
  
  // Batch Queue
  selectItems: string;
  cancelSelect: string;
  selectAll: string;
  deselectAll: string;
  itemsSelected: string;
  bulkTranscode: string;
  bulkShare: string;
  bulkVault: string;
  bulkDelete: string;
  batchProcessingTitle: string;

  // Settings
  sectionAppearance: string;
  theme: string;
  themeDark: string;
  themeLight: string;
  themeSystem: string;
  sectionLanguage: string;
  languageEnglish: string;
  languageUrdu: string;
  sectionDownloads: string;
  wifiOnly: string;
  wifiOnlyDesc: string;
  simultaneousLimit: string;
  warnOnMobileData: string;
  warnOnMobileDataDesc: string;
  askFilename: string;
  askFilenameDesc: string;
  autoDetectClipboardTitle: string;
  autoDetectClipboardDesc: string;
  clipboardVideoDetected: string;
  downloadThisVideo: string;
  sectionPrivacy: string;
  clearHistory: string;
  clearHistorySuccess: string;
  privacyStatement: string;
  sectionAbout: string;
  version: string;
  architectureGuide: string;
  complianceCharter: string;
  viewAndroidCode: string;
  mobileView: string;
  codeView: string;
  // Battery Saver
  sectionBatterySaver: string;
  batterySaverTitle: string;
  batterySaverDesc: string;
  batterySaverActive: string;
  batterySaverInactive: string;
  batteryLevelSim: string;
  batteryCharging: string;
  batteryDischarging: string;
  autoEnableThreshold: string;
  autoEnableThresholdDesc: string;
  limitConcurrencyTitle: string;
  limitConcurrencyDesc: string;
  throttleSpeedTitle: string;
  throttleSpeedDesc: string;
  pauseBackgroundTitle: string;
  pauseBackgroundDesc: string;
  batterySaverStatusActiveMsg: string;
  batterySaverStatusNormalMsg: string;
}

export const translations: Record<AppLanguage, Translations> = {
  en: {
    appName: "All-in-One Downloader",
    tagline: "Ultra-fast media downloader, security vault & 4K transcoder.",
    navHome: "Home",
    navBrowser: "Browser",
    navDownloads: "Downloads",
    navLibrary: "Library",
    navDiscover: "Discover",
    navSettings: "Settings",
    
    pasteLinkPlaceholder: "Paste direct media URL (https://...)",
    pasteFromClipboard: "Paste",
    inspectLink: "Inspect Link",
    inspecting: "Inspecting...",
    quickSampleLinks: "Test Links & Compliance Tests",
    storageUsage: "Device Storage",
    storageFree: "free of",
    storageUsed: "used",
    continueWatching: "Continue Watching",
    resumedFrom: "Resumed from",
    recentDownloads: "Recent Downloads",
    noRecentDownloads: "No recent downloads yet.",
    sampleDirectVideo: "Direct MP4 (1080p CC Video)",
    sampleDirectAudio: "Direct MP3 (Creative Commons Audio)",
    sampleDirectPdf: "Direct PDF (Android Arch Guide)",
    sampleYouTube: "YouTube Link (Policy Check)",
    sampleInstagram: "Instagram Reel (Policy Check)",
    sampleTikTok: "TikTok Video (Policy Check)",
    
    restrictedPlatform: "Download Unavailable for this Link",
    unsupportedPage: "Webpage Detected (No Direct Stream)",
    directDownloadAvailable: "Direct Download Available",
    openInOriginalApp: "Open in Original App",
    openInYouTube: "Open in YouTube",
    openInInstagram: "Open in Instagram",
    openInTikTok: "Open in TikTok",
    openInBrowser: "Open in Browser",
    complianceNoticeTitle: "Platform Rights & Compliance Notice",
    youTubeComplianceMsg: "YouTube's Terms of Service and API policies strictly prohibit downloading, caching, or offline storage of audiovisual streams without prior platform authorization. NovaDownload upholds platform terms and does not provide unauthorized download tools for YouTube.",
    instagramComplianceMsg: "Instagram content is protected by user copyright and Meta Platform Terms. Direct unauthorized scraping of private or social media feeds is not supported. Use the official Instagram app to save posts to your saved collection.",
    tikTokComplianceMsg: "TikTok videos are subject to platform terms and creator rights. Direct extraction without platform API credentials is not permitted.",
    facebookComplianceMsg: "Facebook media cannot be downloaded directly without user account authentication and platform-compliant API approval.",
    unsupportedWebMsg: "This link points to an HTML web page rather than a direct downloadable media stream. You can open it in your browser.",
    
    downloadOptions: "Download Options",
    saveAs: "File Name",
    destinationFolder: "Destination Folder",
    selectQuality: "Select Quality & Format",
    videoFormats: "Video Options",
    audioOnly: "Audio Only",
    startDownload: "Start Download",
    cancel: "Cancel",
    fileAlreadyExists: "A file with this name already exists in your queue.",
    
    tabActive: "Active",
    tabQueued: "Queued",
    tabCompleted: "Completed",
    tabFailed: "Failed",
    pauseAll: "Pause All",
    resumeAll: "Resume All",
    clearCompleted: "Clear Completed",
    emptyDownloads: "Queue is Empty",
    emptyDownloadsDesc: "Paste a direct file link to start a new download.",
    speed: "Speed",
    remaining: "remaining",
    resumeSupported: "Resumable (Range Supported)",
    resumeNotSupported: "Non-Resumable Stream",
    pause: "Pause",
    resume: "Resume",
    retry: "Retry",
    delete: "Delete",
    openFile: "Open / Play",
    statusQueued: "Queued",
    statusStarting: "Connecting...",
    statusDownloading: "Downloading",
    statusPaused: "Paused",
    statusCompleted: "Completed",
    statusFailed: "Failed",
    statusCancelled: "Cancelled",
    
    tabAll: "All Files",
    tabVideos: "Videos",
    tabAudio: "Audio",
    tabImages: "Images",
    tabDocuments: "Documents",
    importMedia: "Import File (SAF)",
    emptyLibrary: "Library is Empty",
    emptyLibraryDesc: "Download direct files or import personal media from your device.",
    play: "Play",
    fileDetails: "File Details",
    rename: "Rename",
    share: "Share",
    confirmDelete: "Delete File?",
    confirmDeleteDesc: "This will remove the file from your local library.",
    size: "Size",
    duration: "Duration",
    dateAdded: "Added",
    sortBy: "Sort By",
    sortDateDesc: "Newest First",
    sortDateAsc: "Oldest First",
    sortNameAsc: "Name (A-Z)",
    sortSizeDesc: "Largest Size",
    
    searchPlaceholder: "Search local files, history & bookmarks...",
    searchHistory: "Recent Searches",
    clearSearchHistory: "Clear History",
    curatedDirectResources: "Permitted Open Direct Media",
    curatedDirectResourcesDesc: "Verified public domain & Creative Commons sample media for testing downloads.",
    webSearchDisclaimer: "Web search powered by Open Web index. Results are for browsing only; downloads require direct file permissions.",
    noSearchResults: "No matching files or records found.",
    
    playbackSpeed: "Speed",
    audioTracks: "Audio Tracks",
    volume: "Volume",
    brightness: "Brightness",
    lockOrientation: "Orientation Lock",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    pictureInPicture: "PiP Mode",
    
    // Batch Queue
    selectItems: "Select Files",
    cancelSelect: "Cancel",
    selectAll: "Select All",
    deselectAll: "Deselect",
    itemsSelected: "selected",
    bulkTranscode: "Bulk Transcode",
    bulkShare: "P2P Share",
    bulkVault: "Move to Vault",
    bulkDelete: "Delete Selected",
    batchProcessingTitle: "Batch Processing Queue",

    sectionAppearance: "Appearance & Theme",
    theme: "Theme Mode",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    themeSystem: "System Default",
    sectionLanguage: "Language & Localization",
    languageEnglish: "English (LTR)",
    languageUrdu: "اردو (Urdu - RTL)",
    sectionDownloads: "Download Preferences",
    wifiOnly: "Download over Wi-Fi Only",
    wifiOnlyDesc: "Pause active downloads when switching to cellular data network.",
    simultaneousLimit: "Simultaneous Downloads",
    warnOnMobileData: "Mobile Data Warning",
    warnOnMobileDataDesc: "Prompt before starting downloads larger than 25 MB on mobile networks.",
    askFilename: "Confirm Filename Before Download",
    askFilenameDesc: "Show filename editor in the options sheet before queuing.",
    autoDetectClipboardTitle: "Auto-Detect Video Links from Clipboard",
    autoDetectClipboardDesc: "Automatically prompt to download when a video link is copied.",
    clipboardVideoDetected: "Video link detected on clipboard",
    downloadThisVideo: "Download this video?",
    sectionPrivacy: "Privacy & Security",
    clearHistory: "Clear Download History & Cache",
    clearHistorySuccess: "Download history cleared successfully.",
    privacyStatement: "Privacy Guarantee: All-in-One Downloader operates 100% on-device. No telemetry, no ad networks, no analytics trackers, and zero server-side credential collection.",
    sectionAbout: "About All-in-One Downloader",
    version: "Version",
    architectureGuide: "Android Architecture",
    complianceCharter: "Legal & Compliance Charter",
    viewAndroidCode: "View Kotlin Source Code",
    mobileView: "App Simulator",
    codeView: "Android Studio Code Hub",

    // Battery Saver
    sectionBatterySaver: "Battery Saver & Power Optimization",
    batterySaverTitle: "Battery Saver Mode",
    batterySaverDesc: "Conserves battery by throttling background download tasks, lowering bandwidth spikes, and limiting CPU wake-locks.",
    batterySaverActive: "Battery Saver Active",
    batterySaverInactive: "Normal Power Profile",
    batteryLevelSim: "Simulated Battery Level",
    batteryCharging: "Charging",
    batteryDischarging: "On Battery",
    autoEnableThreshold: "Auto-Enable on Low Battery",
    autoEnableThresholdDesc: "Automatically engages battery saver mode when device charge drops below this level.",
    limitConcurrencyTitle: "Enforce Single Download Concurrency",
    limitConcurrencyDesc: "Limits active downloads to 1 at a time to prevent multi-core CPU and radio transceiver saturation.",
    throttleSpeedTitle: "Throttle Transfer Bandwidth & Polling",
    throttleSpeedDesc: "Slows byte polling intervals from 400ms to 800ms and caps speeds to ~550 KB/s to minimize radio battery drain.",
    pauseBackgroundTitle: "Pause Heavy Background Sniffing",
    pauseBackgroundDesc: "Suspends media sniffing and deep network analyzers when app is inactive or battery is low.",
    batterySaverStatusActiveMsg: "Power Saver is throttling background sync and download concurrency to 1 active stream.",
    batterySaverStatusNormalMsg: "Normal power mode. Maximum parallel throughput and background acceleration enabled."
  },
  ur: {
    appName: "آل اِن ون ڈاؤنلوڈر",
    tagline: "تیز ترین میڈیا ڈاؤنلوڈر، محفوظ والٹ اور 4K ٹرانسکوڈر۔",
    navHome: "ہوم",
    navBrowser: "براؤزر",
    navDownloads: "ڈاؤن لوڈز",
    navLibrary: "لائبریری",
    navDiscover: "دریافت",
    navSettings: "ترتیبات",
    
    pasteLinkPlaceholder: "براہ راست میڈیا یو آر ایل پیسٹ کریں (https://...)",
    pasteFromClipboard: "پیسٹ کریں",
    inspectLink: "لنک چیک کریں",
    inspecting: "جانچ ہو رہی ہے...",
    quickSampleLinks: "ٹیسٹ لنکس اور تعمیل کے نمونے",
    storageUsage: "ڈیوائس اسٹوریج",
    storageFree: "خالی ہے کل",
    storageUsed: "استعمال شدہ",
    continueWatching: "دیکھنا جاری رکھیں",
    resumedFrom: "دوبارہ شروع ہوا از",
    recentDownloads: "حالیہ ڈاؤن لوڈز",
    noRecentDownloads: "ابھی کوئی حالیہ ڈاؤن لوڈ نہیں۔",
    sampleDirectVideo: "ڈائریکٹ ویڈیو (1080p MP4)",
    sampleDirectAudio: "ڈائریکٹ آڈیو (CC MP3)",
    sampleDirectPdf: "ڈائریکٹ دستاویز (PDF گائیڈ)",
    sampleYouTube: "یوٹیوب لنک (پالیسی چیک)",
    sampleInstagram: "انسٹاگرام ریل (پالیسی چیک)",
    sampleTikTok: "ٹک ٹاک ویڈیو (پالیسی چیک)",
    
    restrictedPlatform: "اس لنک سے ڈاؤن لوڈ دستیاب نہیں ہے",
    unsupportedPage: "ویب صفحہ شناخت ہوا (براہ راست فائل نہیں)",
    directDownloadAvailable: "براہ راست ڈاؤن لوڈ دستیاب ہے",
    openInOriginalApp: "اصل ایپ میں کھولیں",
    openInYouTube: "یوٹیوب میں کھولیں",
    openInInstagram: "انسٹاگرام میں کھولیں",
    openInTikTok: "ٹک ٹاک میں کھولیں",
    openInBrowser: "براؤزر میں کھولیں",
    complianceNoticeTitle: "پلیٹ فارم حقوق اور تعمیل کا نوٹس",
    youTubeComplianceMsg: "یوٹیوب کی سروس کی شرائط اور اے پی آئی پالیسیاں پیشگی اجازت کے بغیر آڈیو ویژول مواد کو ڈاؤن لوڈ، محفوظ یا آف لائن چلانے کی سختی سے ممانعت کرتی ہیں۔ نووا ڈاؤن لوڈ قانونی قواعد کا احترام کرتا ہے اور یوٹیوب کے لیے غیر مجاز ڈاؤن لوڈ پیش نہیں کرتا۔",
    instagramComplianceMsg: "انسٹاگرام کا مواد کاپی رائٹ اور میٹا پالیسیوں کے تحت محفوظ ہے۔ براہ راست اسکریپنگ کی اجازت نہیں ہے۔ پوسٹ محفوظ کرنے کے لیے آفیشل ایپ استعمال کریں۔",
    tikTokComplianceMsg: "ٹک ٹاک ویڈیوز پلیٹ فارم شرائط اور تخلیق کار کے حقوق کے تحت آتی ہیں۔ بغیر اجازت ڈاؤن لوڈنگ معطل ہے۔",
    facebookComplianceMsg: "فیس بک میڈیا اکاؤنٹ کی توثیق کے بغیر براہ راست ڈاؤن لوڈ نہیں کیا جا سکتا۔",
    unsupportedWebMsg: "یہ لنک کسی میڈیا فائل کے بجائے ایک عمومی ویب صفحہ ہے۔ آپ اسے براؤزر میں دیکھ سکتے ہیں۔",
    
    downloadOptions: "ڈاؤن لوڈ کے اختیارات",
    saveAs: "فائل کا نام",
    destinationFolder: "محفوظ کرنے کی جگہ",
    selectQuality: "کوالٹی اور فارمیٹ منتخب کریں",
    videoFormats: "ویڈیو اختیارات",
    audioOnly: "صرف آڈیو",
    startDownload: "ڈاؤن لوڈ شروع کریں",
    cancel: "منسوخ کریں",
    fileAlreadyExists: "اس نام کی فائل پہلے سے فہرست میں موجود ہے۔",
    
    tabActive: "جاری",
    tabQueued: "قطار میں",
    tabCompleted: "مکمل شدہ",
    tabFailed: "ناکام",
    pauseAll: "سب روکیں",
    resumeAll: "سب دوبارہ شروع کریں",
    clearCompleted: "مکمل شدہ صاف کریں",
    emptyDownloads: "ڈاؤن لوڈ قطار خالی ہے",
    emptyDownloadsDesc: "نیا ڈاؤن لوڈ شروع کرنے کے لیے براہ راست لنک پیسٹ کریں۔",
    speed: "رفتار",
    remaining: "باقی وقت",
    resumeSupported: "دوبارہ شروع ہو سکتا ہے (Range سپورٹ)",
    resumeNotSupported: "نان-ریزیوم ایبل سلسلہ",
    pause: "روکیں",
    resume: "شروع کریں",
    retry: "دوبارہ کوشش کریں",
    delete: "حذف کریں",
    openFile: "کھولیں / چلائیں",
    statusQueued: "قطار میں ہے",
    statusStarting: "رابطہ ہو رہا ہے...",
    statusDownloading: "ڈاؤن لوڈ جاری ہے",
    statusPaused: "روک دیا گیا",
    statusCompleted: "مکمل ہو گیا",
    statusFailed: "ناکام ہوا",
    statusCancelled: "منسوخ ہوا",
    
    tabAll: "تمام فائلیں",
    tabVideos: "ویڈیوز",
    tabAudio: "آڈیو",
    tabImages: "تصاویر",
    tabDocuments: "دستاویزات",
    importMedia: "فائل امپورٹ کریں (SAF)",
    emptyLibrary: "لائبریری خالی ہے",
    emptyLibraryDesc: "براہ راست فائلیں ڈاؤن لوڈ کریں یا ڈیوائس سے ذاتی میڈیا شامل کریں۔",
    play: "چلائیں",
    fileDetails: "فائل کی تفصیلات",
    rename: "نام بدلیں",
    share: "شیئر کریں",
    confirmDelete: "فائل حذف کریں؟",
    confirmDeleteDesc: "یہ فائل آپ کی مقامی لائبریری سے ہٹا دی جائے گی۔",
    size: "سائز",
    duration: "دورانیہ",
    dateAdded: "تاریخ شمولیت",
    sortBy: "ترتیب دیں",
    sortDateDesc: "تازہ ترین پہلے",
    sortDateAsc: "پرانی پہلے",
    sortNameAsc: "نام (الف تا ے)",
    sortSizeDesc: "بڑا سائز پہلے",
    
    searchPlaceholder: "مقامی فائلیں، تاریخ اور بک مارکس تلاش کریں...",
    searchHistory: "حالیہ تلاشیں",
    clearSearchHistory: "تلاش کی تاریخ صاف کریں",
    curatedDirectResources: "مجاز عوامی میڈیا وسائل",
    curatedDirectResourcesDesc: "ٹیسٹنگ کے لیے تصدیق شدہ پبلک ڈومین اور تخلیقی کامن میڈیا نمونے۔",
    webSearchDisclaimer: "ویب سرچ صرف براؤزنگ کے لیے ہے۔ ڈاؤن لوڈ کے لیے براہ راست فائل کی اجازت ضروری ہے۔",
    noSearchResults: "کوئی مماثل فائل یا ریکارڈ نہیں ملا۔",
    
    playbackSpeed: "رفتار",
    audioTracks: "آڈیو ٹریکس",
    volume: "آواز",
    brightness: "روشنی",
    lockOrientation: "اسکرین لاک",
    fullscreen: "پوری اسکرین",
    exitFullscreen: "عام اسکرین",
    pictureInPicture: "تصویر میں تصویر (PiP)",
    
    // Batch Queue
    selectItems: "فائلیں منتخب کریں",
    cancelSelect: "منسوخ",
    selectAll: "سبھی منتخب کریں",
    deselectAll: "غیر منتخب کریں",
    itemsSelected: "منتخب شدہ",
    bulkTranscode: "ایک ساتھ ٹرانسکوڈ",
    bulkShare: "پی ٹو پی بھیجیں",
    bulkVault: "والٹ میں محفوظ کریں",
    bulkDelete: "منتخب حذف کریں",
    batchProcessingTitle: "بیچ پروسیسنگ قطار",

    sectionAppearance: "ظاہری شکل اور تھیم",
    theme: "تھیم موڈ",
    themeDark: "ڈارک موڈ",
    themeLight: "لائٹ موڈ",
    themeSystem: "سسٹم ڈیفالٹ",
    sectionLanguage: "زبان اور علاقائی ترتیبات",
    languageEnglish: "انگریزی (English)",
    languageUrdu: "اردو (Urdu)",
    sectionDownloads: "ڈاؤن لوڈ ترجیحات",
    wifiOnly: "صرف وائی فائی پر ڈاؤن لوڈ کریں",
    wifiOnlyDesc: "موبائل ڈیٹا پر سوئچ ہونے پر خودکار طور پر ڈاؤن لوڈ روک دیں۔",
    simultaneousLimit: "بیک وقت ڈاؤن لوڈز کی حد",
    warnOnMobileData: "موبائل ڈیٹا وارننگ",
    warnOnMobileDataDesc: "موبائل نیٹ ورک پر 25 ایم بی سے بڑی فائلوں سے پہلے پوچھیں۔",
    askFilename: "ڈاؤن لوڈ سے پہلے فائل کے نام کی تصدیق",
    askFilenameDesc: "قطار میں شامل کرنے سے پہلے نام بدلنے کا موقع دیں۔",
    autoDetectClipboardTitle: "کلپ بورڈ سے ویڈیو لنک کی خودکار شناخت",
    autoDetectClipboardDesc: "ویڈیو کا لنک کاپی ہونے پر خودکار طور پر ڈاؤن لوڈ کرنے کی تجویز دیں۔",
    clipboardVideoDetected: "کلپ بورڈ پر ویڈیو لنک ملا ہے",
    downloadThisVideo: "کیا یہ ویڈیو ڈاؤن لوڈ کرنی ہے؟",
    sectionPrivacy: "رازداری اور اسٹوریج",
    clearHistory: "ڈاؤن لوڈ تاریخ اور کیشے صاف کریں",
    clearHistorySuccess: "ڈاؤن لوڈ ہسٹری کامیابی سے صاف کر دی گئی۔",
    privacyStatement: "رازداری کی ضمانت: آل اِن ون ڈاؤنلوڈر تمام کارروائیاں آپ کی ڈیوائس پر انجام دیتا ہے۔ کوئی ٹریکر یا بیرونی اشتہار موجود نہیں ہے۔",
    sectionAbout: "آل اِن ون ڈاؤنلوڈر کے بارے میں",
    version: "ورژن",
    architectureGuide: "اینڈرائیڈ آرکیٹیکچر",
    complianceCharter: "قانونی اور تعمیل چارٹر",
    viewAndroidCode: "کوٹلن سورس کوڈ دیکھیں",
    mobileView: "ایپ سمیلیٹر",
    codeView: "اینڈرائیڈ اسٹوڈیو کوڈ ہب",

    // Battery Saver
    sectionBatterySaver: "بیٹری سیور اور پاور کی بچت",
    batterySaverTitle: "بیٹری سیور موڈ",
    batterySaverDesc: "بیٹری کم ہونے پر پس منظر ڈاؤن لوڈز اور پروسیسز کو محدود کر کے پاور بچاتا ہے۔",
    batterySaverActive: "بیٹری سیور فعال ہے",
    batterySaverInactive: "معمول کی پاور پروفائل",
    batteryLevelSim: "بیٹری کی مقدار (ٹیسٹ سلائیڈر)",
    batteryCharging: "چارجنگ ہو رہی ہے",
    batteryDischarging: "بیٹری پر",
    autoEnableThreshold: "کم بیٹری پر خودکار فعال کریں",
    autoEnableThresholdDesc: "جب بیٹری اس حد سے کم ہو جائے تو خودکار طور پر بیٹری سیور شروع کریں۔",
    limitConcurrencyTitle: "صرف 1 ڈاؤن لوڈ بیک وقت",
    limitConcurrencyDesc: "پروسیسر اور موڈیم پر بوجھ کم کرنے کے لیے بیک وقت صرف 1 فائل ڈاؤن لوڈ ہوگی۔",
    throttleSpeedTitle: "رفتار اور فریکوئنسی محدود کریں",
    throttleSpeedDesc: "پولنگ وقت 400ms سے بڑھا کر 800ms اور رفتار ~550 KB/s کر کے بیٹری بچائیں۔",
    pauseBackgroundTitle: "پس منظر کی بھاری جانچ روکیں",
    pauseBackgroundDesc: "کم بیٹری پر میڈیا سونگھنے اور غیر ضروری اینیمیشنز کو معطل کریں۔",
    batterySaverStatusActiveMsg: "بیٹری سیور موڈ فعال ہے: بیک گراؤنڈ پروسیسز اور رفتار کم کر دی گئی ہے۔",
    batterySaverStatusNormalMsg: "معمول کی کارکردگی: تمام تیز رفتار ڈاؤن لوڈز اور اینیمیشنز فعال ہیں۔"
  }
};
