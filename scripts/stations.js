// База радиостанций
const stations = [
    // Русские радио
    { code: "EUROPA_PLUS", url: "https://ep128.hostingradio.ru:8030/ep128", bitrate: "128" },
    { code: "DOROGNOE", url: "https://dorognoe.hostingradio.ru:8000/radio", bitrate: "128" },
    { code: "NASHE", url: "https://nashe1.hostingradio.ru/nashe-256", bitrate: "256" },
    { code: "VESTI_FM", url: "https://icecast-vgtrk.cdnvideo.ru/vestifm_mp3_128kbps", bitrate: "128" },
    { code: "MAYAK", url: "https://icecast-vgtrk.cdnvideo.ru/mayakfm_mp3_192kbps", bitrate: "192" },
    { code: "RADIO_7", url: "https://radio7.ru:8000/radio7_128", bitrate: "128" },
    
    // SomaFM - всегда работают
    { code: "SOMA_GROOVE", url: "https://ice1.somafm.com/groovesalad-128-mp3", bitrate: "128" },
    { code: "SOMA_DRONE", url: "https://ice1.somafm.com/dronezone-128-mp3", bitrate: "128" },
    { code: "SOMA_SPACE", url: "https://ice1.somafm.com/spacestation-128-mp3", bitrate: "128" },
    { code: "SOMA_SECRET", url: "https://ice1.somafm.com/secretagent-128-mp3", bitrate: "128" },
    
    // Infomaniak - стабильные
    { code: "ROCK_RADIO", url: "https://rockradio.ice.infomaniak.ch/rockradio-high.mp3", bitrate: "128" },
    { code: "HIPHOP_RADIO", url: "https://hiphopradio.ice.infomaniak.ch/hiphopradio-high.mp3", bitrate: "128" },
    { code: "ELECTRONIC", url: "https://electronicradio.ice.infomaniak.ch/electronicradio-high.mp3", bitrate: "128" },
    { code: "JAZZ_RADIO", url: "https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3", bitrate: "128" },
    { code: "BLUES_RADIO", url: "https://bluesradio.ice.infomaniak.ch/bluesradio-high.mp3", bitrate: "128" },
    { code: "LOUNGE_RADIO", url: "https://lounge.ice.infomaniak.ch/lounge-high.mp3", bitrate: "128" },
    
    // Другие рабочие
    { code: "CHILLTRAX", url: "https://streaming.radio.co/s20c4e8e24/listen", bitrate: "128" },
    { code: "DEEPHOUSE", url: "https://streaming.radio.co/s8c6e5b3a6/listen", bitrate: "128" },
    { code: "AMBIENT", url: "https://ambient.online.radio.br:18000/stream", bitrate: "128" },
    
    // Резервные
    { code: "RADIO_VERA", url: "https://radiovera.hostingradio.ru:8000/radiovera256.mp3", bitrate: "256" },
    { code: "RADIO_BOOK", url: "https://radiokniga.hostingradio.ru:8000/radiokniga128.mp3", bitrate: "128" }
];