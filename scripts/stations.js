// База радиостанций
const stations = [
    // ========== РУССКИЕ РАДИОСТАНЦИИ ==========
    { code: "Маруся ФМ", url: "https://radio.garden/api/ara/content/listen/0wrhdLW3/channel.mp3", bitrate: "128" },
    { code: "Европа Плюс", url: "https://ep128.hostingradio.ru:8030/ep128", bitrate: "128" },
    { code: "Наше Радио", url: "https://nashe1.hostingradio.ru/nashe-256", bitrate: "256" },
    { code: "Новое Радио", url: "https://radio.garden/api/ara/content/listen/hTfe1XIo/channel.mp3", bitrate: "128" },
    { code: "Кавказ Хит", url: "https://radio.garden/api/ara/content/listen/NOchthUJ/channel.mp3", bitrate: "128" },
    { code: "Радио Книга", url: "https://radio.garden/api/ara/content/listen/8SZLRTtq/channel.mp3", bitrate: "128" },
    { code: "DNB FM", url: "https://radio.garden/api/ara/content/listen/Ze7ZWy4i/channel.mp3", bitrate: "128" },
    { code: "ВЕСТИ ФМ", url: "https://icecast-vgtrk.cdnvideo.ru/vestifm_mp3_128kbps", bitrate: "128" },

    // ========== radio.garden ==========
    { code: "Юмор ФМ. Stand-ups", url: "https://radio.garden/api/ara/content/listen/RBQ5JmK8/channel.mp3", bitrate: "128" },
    { code: "Cyber Space", url: "https://radio.garden/api/ara/content/listen/fZylWF8k/channel.mp3", bitrate: "128" },
    { code: "ARENA RADIO", url: "https://radio.garden/api/ara/content/listen/MJ6nKSDY/channel.mp3", bitrate: "128" },
    { code: "Nuclear Fallout Radio", url: "https://radio.garden/api/ara/content/listen/jNdh1upw/channel.mp3", bitrate: "128" },
    { code: "Metal", url: "https://radio.garden/api/ara/content/listen/WOjOFzmS/channel.mp3", bitrate: "128" },
    { code: "Nature", url: "https://radio.garden/api/ara/content/listen/U5e8t9Mq/channel.mp3", bitrate: "128" },
    { code: "Russian Folk", url: "https://radio.garden/api/ara/content/listen/PYsw1APK/channel.mp3", bitrate: "128" },
    { code: "Агата Кристи", url: "https://radio.garden/api/ara/content/listen/OiPZ8jY5/channel.mp3", bitrate: "128" },
    { code: "Русское Регги", url: "https://radio.garden/api/ara/content/listen/3PKzsSgL/channel.mp3", bitrate: "128" },
    { code: "Французский Рэп", url: "https://radio.garden/api/ara/content/listen/PMV58Y70/channel.mp3", bitrate: "128" },

    // ==========  ANIMA AMORIS ==========
    { code: "[Trance]", url: "https://amoris.sknt.ru/trance", bitrate: "128" },
    { code: "[Dub Techno]", url: "https://amoris.sknt.ru/dubtechno", bitrate: "128" },
    { code: "[Electronic Styles]", url: "https://amoris.sknt.ru/electronic", bitrate: "128" },
    { code: "[Goa Psy Trance]", url: "https://amoris.sknt.ru/goa", bitrate: "128" },
    { code: "[Dub Step]", url: "https://amoris.sknt.ru/dubstep", bitrate: "128" },
    { code: "[Drum and Bass]", url: "https://amoris.sknt.ru/dnb", bitrate: "128" },
    { code: "[Minimal Deep Techno]", url: "https://amoris.sknt.ru/minimal", bitrate: "128" },
    { code: "[IDM]", url: "https://amoris.sknt.ru/idm", bitrate: "128" },
    { code: "[New Age]", url: "https://amoris.sknt.ru/newage", bitrate: "128" },
    { code: "[Trip Hop Lounge]", url: "https://amoris.sknt.ru/triphop", bitrate: "128" },
    { code: "[Bible]", url: "https://amoris.sknt.ru/bible", bitrate: "128" },
    { code: "[Christian Psalm]", url: "https://amoris.sknt.ru/psalm", bitrate: "128" },

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
    { code: "SOMA_FOLK", url: "https://ice1.somafm.com/folkfwd-128-mp3", bitrate: "128" },
    { code: "SOMA_BEATS", url: "https://ice1.somafm.com/thetrip-128-mp3", bitrate: "128" },
    { code: "SOMA_METAL", url: "https://ice1.somafm.com/metal-128-mp3", bitrate: "128" },
    { code: "SOMA_THISTLE", url: "https://ice1.somafm.com/thistle-128-mp3", bitrate: "128" },
    { code: "SOMA_SYNTH", url: "https://ice1.somafm.com/synphaera-128-mp3", bitrate: "128" },

    // ========== JAZZ MANIAK ==========
    { code: "SMOOTH JAZZ", url: "https://smoothjazz.cdnstream1.com/2634_128.mp3", bitrate: "128" },
    { code: "JAZZ_RADIO", url: "https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3", bitrate: "128" },
    { code: "CLASSIC_FM", url: "https://media-ssl.musicradio.com/ClassicFM", bitrate: "128" },
    { code: "RADIO_MEUH_RAP", url: "https://radiomeuh.ice.infomaniak.ch/radiomeuh-128.mp3", bitrate: "128" },
    { code: "TSF_JAZZ_HIPHOP", url: "https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3", bitrate: "128" },

    // ========== ВЫСОКОЕ КАЧЕСТВО ==========
    { code: "SOMA_SPACE_320", url: "https://ice1.somafm.com/spacestation-320-mp3", bitrate: "320" },
];
