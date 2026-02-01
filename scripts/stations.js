// База радиостанций
const stations = [
    // ========== РУССКИЕ РАДИОСТАНЦИИ ==========
    { code: "ЕВРОПА ПЛЮС", url: "https://ep128.hostingradio.ru:8030/ep128", bitrate: "128" },
    { code: "ДОРОЖНОЕ", url: "https://dorognoe.hostingradio.ru:8000/radio", bitrate: "128" },
    { code: "НАШЕ РАДИО", url: "https://nashe1.hostingradio.ru/nashe-256", bitrate: "256" },
    { code: "ВЕСТИ ФМ", url: "https://icecast-vgtrk.cdnvideo.ru/vestifm_mp3_128kbps", bitrate: "128" },
    { code: "МАЯК", url: "https://icecast-vgtrk.cdnvideo.ru/mayakfm_mp3_192kbps", bitrate: "192" },
    { code: "МОНТЕ КАРЛО", url: "https://montecarlo.hostingradio.ru/montecarlo128.mp3", bitrate: "128" },
    { code: "Cyber Space", url: "https://radio.garden/api/ara/content/listen/fZylWF8k/channel.mp3?1769978366553", bitrate: "128" },
    { code: "Humor FM. Stand-ups", url: "https://radio.garden/api/ara/content/listen/RBQ5JmK8/channel.mp3?1769978483974", bitrate: "128" },
    { code: "101.RU - Metal", url: "https://radio.garden/api/ara/content/listen/WOjOFzmS/channel.mp3?1769978539192", bitrate: "128" },
    { code: "101.RU - Nature", url: "https://radio.garden/api/ara/content/listen/U5e8t9Mq/channel.mp3?1769978577694", bitrate: "128" },
    { code: "101.RU - Russian Folk", url: "https://radio.garden/api/ara/content/listen/PYsw1APK/channel.mp3?1769978651180", bitrate: "128" },
    { code: "101.RU - Агата Кристи", url: "https://radio.garden/api/ara/content/listen/OiPZ8jY5/channel.mp3?1769978730249", bitrate: "128" },
    { code: "101.RU - Русское Регги", url: "https://radio.garden/api/ara/content/listen/3PKzsSgL/channel.mp3?1769978772952", bitrate: "128" },
    { code: "101.RU - Французский Рэп", url: "https://radio.garden/api/ara/content/listen/PMV58Y70/channel.mp3?1769978817353", bitrate: "128" },

    // ========== SOMA FM ========== 
    { code: "SOMA_GROOVE", url: "https://ice1.somafm.com/groovesalad-128-mp3", bitrate: "128" },
    { code: "SOMA_DRONE", url: "https://ice1.somafm.com/dronezone-128-mp3", bitrate: "128" },
    { code: "SOMA_SPACE", url: "https://ice1.somafm.com/spacestation-128-mp3", bitrate: "128" },
    { code: "SOMA_SECRET", url: "https://ice1.somafm.com/secretagent-128-mp3", bitrate: "128" },
    { code: "SOMA_LUSH", url: "https://ice1.somafm.com/lush-128-mp3", bitrate: "128" },
    { code: "SOMA_CHILL", url: "https://ice1.somafm.com/defcon-128-mp3", bitrate: "128" },
    { code: "SOMA_BAGEL", url: "https://ice1.somafm.com/bagel-128-mp3", bitrate: "128" },
    { code: "SOMA_CLIQHOP", url: "https://ice1.somafm.com/cliqhop-128-mp3", bitrate: "128" },
    { code: "SOMA_INDIE", url: "https://ice1.somafm.com/indiepop-128-mp3", bitrate: "128" },
    { code: "SOMA_DARK", url: "https://ice1.somafm.com/darkzone-128-mp3", bitrate: "128" },
    { code: "SOMA_FLUID", url: "https://ice1.somafm.com/fluid-128-mp3", bitrate: "128" },
    { code: "SOMA_SONIC", url: "https://ice1.somafm.com/sonicuniverse-128-mp3", bitrate: "128" },
    { code: "SOMA_FOLK", url: "https://ice1.somafm.com/folkfwd-128-mp3", bitrate: "128" },
    { code: "SOMA_BEATS", url: "https://ice1.somafm.com/thetrip-128-mp3", bitrate: "128" },
    { code: "SOMA_METAL", url: "https://ice1.somafm.com/metal-128-mp3", bitrate: "128" },
    { code: "SOMA_THISTLE", url: "https://ice1.somafm.com/thistle-128-mp3", bitrate: "128" },
    { code: "SOMA_SYNTH", url: "https://ice1.somafm.com/synphaera-128-mp3", bitrate: "128" },
    { code: "SOMA_ILLINOIS", url: "https://ice1.somafm.com/illstreet-128-mp3", bitrate: "128" },
    { code: "SOMA_SPACEFLIGHT", url: "https://ice6.somafm.com/spacestation-128-mp3", bitrate: "128" },

    // ========== JAZZ MANIAK ==========
    { code: "SMOOTH JAZZ", url: "https://smoothjazz.cdnstream1.com/2634_128.mp3", bitrate: "128" },
    { code: "JAZZ_RADIO", url: "https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3", bitrate: "128" },
    { code: "CLASSIC_FM", url: "https://media-ssl.musicradio.com/ClassicFM", bitrate: "128" },
    { code: "RADIO_MEUH_RAP", url: "https://radiomeuh.ice.infomaniak.ch/radiomeuh-128.mp3", bitrate: "128" },
    { code: "TSF_JAZZ_HIPHOP", url: "https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3", bitrate: "128" },
    
    // ========== SPB ==========
    { code: "ARENA RADIO", url: "https://radio.garden/api/ara/content/listen/MJ6nKSDY/channel.mp3?1769976700875", bitrate: "128" },

    // ========== PARIS ==========
    { code: "Beur FM", url: "https://radio.garden/api/ara/content/listen/pqiv5qqM/channel.mp3?1769977422135", bitrate: "128" },
    { code: "Skyrock 100% Français", url: "https://radio.garden/api/ara/content/listen/CMp3iU5t/channel.mp3?1769977521822", bitrate: "128" },
    { code: "Skyrock Rap & RnB Non Stop", url: "https://radio.garden/api/ara/content/listen/pof-lXtB/channel.mp3?1769977683362", bitrate: "128" },

    // ========== РЕЗЕРВНЫЕ/АЛЬТЕРНАТИВНЫЕ ПОТОКИ SOMA ==========
    { code: "SOMA_GROOVE2", url: "https://ice2.somafm.com/groovesalad-128-mp3", bitrate: "128" },
    { code: "SOMA_DRONE2", url: "https://ice4.somafm.com/dronezone-128-mp3", bitrate: "128" },
    { code: "SOMA_SPACE2", url: "https://ice3.somafm.com/spacestation-128-mp3", bitrate: "128" },
    { code: "SOMA_SECRET2", url: "https://ice5.somafm.com/secretagent-128-mp3", bitrate: "128" },

    // ========== ВЫСОКОЕ КАЧЕСТВО ==========
    { code: "SOMA_SPACE_320", url: "https://ice1.somafm.com/spacestation-320-mp3", bitrate: "320" },
];
