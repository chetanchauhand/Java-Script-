
"use strict";

// =============================================
// NOVA SMART LIFE - MAIN JAVASCRIPT
// =============================================

const $ = id => document.getElementById(id);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let alarms = JSON.parse(localStorage.getItem("novaAlarms") || "[]");
let editingId = null;
let is24Hour = false;

let audioContext = null;
let alarmOscillator = null;
let soundTimer = null;
let ringingAlarm = null;
let ringingId = null;
let snoozeTimer = null;

let songs = [];
let currentSong = -1;
let city = "Ludhiana";
let currentCoords = null;

// =============================================
// CLOCK
// =============================================

function updateClock() {
    const now = new Date();

    $("clock").textContent = new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: !is24Hour
    }).format(now);

    $("ampm").textContent = is24Hour
        ? "24 HOUR"
        : now.getHours() >= 12 ? "PM" : "AM";

    $("date").textContent = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const h = now.getHours();

    $("greeting").textContent =
        h < 12 ? "A fresh morning. Make it count." :
        h < 17 ? "Keep going. You're doing great." :
        h < 21 ? "Slow down and enjoy your evening." :
        "Rest well. Tomorrow is another opportunity.";
}

$("formatBtn").addEventListener("click", () => {
    is24Hour = !is24Hour;
    $("formatBtn").textContent = is24Hour ? "24 H" : "12 H";
    updateClock();
    renderAlarms();
    updateStats();
});

updateClock();
setInterval(updateClock, 1000);

// =============================================
// THEME
// =============================================

function loadTheme() {
    const theme = localStorage.getItem("novaTheme");
    document.body.classList.toggle("light", theme === "light");
}

$("themeBtn").addEventListener("click", () => {
    const light = document.body.classList.toggle("light");
    localStorage.setItem("novaTheme", light ? "light" : "dark");
});

loadTheme();

// =============================================
// NAVIGATION
// =============================================

document.querySelectorAll(".nav").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav").forEach(n =>
            n.classList.remove("active")
        );

        button.classList.add("active");

        const target = $(button.dataset.target);

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

// =============================================
// AUDIO CONTEXT
// =============================================

function unlockAudio() {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
        audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume().catch(console.error);
    }
}

// =============================================
// STORAGE
// =============================================

function saveAlarms() {
    localStorage.setItem("novaAlarms", JSON.stringify(alarms));
    renderAlarms();
    updateStats();
}

// =============================================
// TIME FORMAT
// =============================================

function formatTime(time) {
    if (is24Hour) return time;

    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;

    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

// =============================================
// ALARM MODAL
// =============================================

function openModal(alarm = null) {
    editingId = alarm ? alarm.id : null;

    $("modalTitle").textContent =
        alarm ? "Edit Alarm" : "Create Alarm";

    $("alarmTime").value = alarm?.time || "07:00";
    $("alarmName").value = alarm?.name || "";
    $("soundType").value = alarm?.sound || "classic";
    $("snoozeDuration").value = String(alarm?.snooze || 5);

    document.querySelectorAll(".days button").forEach(btn => {
        const day = Number(btn.dataset.day);

        btn.classList.toggle(
            "selected",
            alarm ? alarm.days.includes(day) : false
        );
    });

    $("alarmModal").classList.add("show");
}

function closeModal() {
    $("alarmModal").classList.remove("show");
    editingId = null;
}

$("addBtn").addEventListener("click", () => openModal());
$("closeModal").addEventListener("click", closeModal);
$("cancelModal").addEventListener("click", closeModal);

$("days").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (button) button.classList.toggle("selected");
});

// =============================================
// SAVE / EDIT ALARM
// =============================================

$("saveAlarm").addEventListener("click", async () => {
    unlockAudio();

    const time = $("alarmTime").value;
    const name = $("alarmName").value.trim();

    if (!time) {
        alert("Please select an alarm time.");
        return;
    }

    const days = [...document.querySelectorAll(".days button.selected")]
        .map(btn => Number(btn.dataset.day));

    const data = {
        time,
        name: name || "Personal Alarm",
        days,
        sound: $("soundType").value,
        snooze: Number($("snoozeDuration").value)
    };

    if (editingId !== null) {
        const alarm = alarms.find(a => a.id === editingId);

        if (alarm) Object.assign(alarm, data, { enabled: true });
    } else {
        alarms.push({
            id: Date.now(),
            ...data,
            enabled: true
        });
    }

    saveAlarms();
    closeModal();
});

// =============================================
// DISPLAY ALARMS
// =============================================

function renderAlarms() {
    const list = $("alarmList");
    list.innerHTML = "";

    if (alarms.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "No alarms created. Click + New Alarm to begin.";
        list.appendChild(empty);
        return;
    }

    alarms.forEach(alarm => {
        const daysText = alarm.days.length === 0
            ? "One time"
            : alarm.days.length === 7
                ? "Every day"
                : alarm.days.map(d => DAYS[d]).join(" · ");

        const item = document.createElement("div");
        item.className = "alarm-item";

        const info = document.createElement("div");

        const time = document.createElement("div");
        time.className = "alarm-time";
        time.textContent = formatTime(alarm.time);

        const name = document.createElement("div");
        name.className = "alarm-name";
        name.textContent = alarm.name;

        const repeat = document.createElement("div");
        repeat.className = "alarm-days";
        repeat.textContent = `${daysText} · ${alarm.sound}`;

        info.append(time, name, repeat);

        const actions = document.createElement("div");
        actions.className = "alarm-actions";

        const edit = document.createElement("button");
        edit.className = "small-btn";
        edit.textContent = "Edit";
        edit.addEventListener("click", () => openModal(alarm));

        const remove = document.createElement("button");
        remove.className = "small-btn";
        remove.textContent = "×";
        remove.title = "Delete";

        remove.addEventListener("click", () => {
            if (confirm("Delete this alarm?")) {
                alarms = alarms.filter(a => a.id !== alarm.id);
                saveAlarms();
            }
        });

        const toggle = document.createElement("button");
        toggle.className = `switch ${alarm.enabled ? "on" : ""}`;
        toggle.title = "Enable or disable";

        toggle.addEventListener("click", () => {
            alarm.enabled = !alarm.enabled;
            saveAlarms();
        });

        actions.append(edit, remove, toggle);
        item.append(info, actions);
        list.appendChild(item);
    });
}

// =============================================
// DASHBOARD STATISTICS
// =============================================

function getNextAlarm() {
    const now = new Date();
    let best = null;
    let bestTime = Infinity;

    alarms.filter(a => a.enabled).forEach(alarm => {
        for (let offset = 0; offset <= 7; offset++) {
            const candidate = new Date(now);
            candidate.setDate(now.getDate() + offset);

            if (alarm.days.length &&
                !alarm.days.includes(candidate.getDay())) {
                continue;
            }

            const [h, m] = alarm.time.split(":").map(Number);
            candidate.setHours(h, m, 0, 0);

            if (candidate > now && candidate.getTime() < bestTime) {
                best = alarm;
                bestTime = candidate.getTime();
            }

            break;
        }
    });

    return best;
}

function updateStats() {
    $("total").textContent = alarms.length;

    $("active").textContent =
        alarms.filter(a => a.enabled).length;

    const next = getNextAlarm();
    $("next").textContent = next ? formatTime(next.time) : "--:--";
}

// =============================================
// ALARM SOUND ENGINE
// =============================================

function stopTone() {
    if (soundTimer) {
        clearInterval(soundTimer);
        soundTimer = null;
    }

    if (alarmOscillator) {
        try {
            alarmOscillator.stop();
        } catch (error) {}

        alarmOscillator = null;
    }
}

function playTone(type) {
    stopTone();
    unlockAudio();

    if (!audioContext) return;

    const patterns = {
        classic: [880, 660],
        digital: [1000, 1000, 600],
        gentle: [523, 659, 784]
    };

    const notes = patterns[type] || patterns.classic;
    let index = 0;

    function beep() {
        if (!audioContext || audioContext.state !== "running") return;

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = notes[index % notes.length];

        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.15, audioContext.currentTime + 0.03
        );
        gain.gain.exponentialRampToValueAtTime(
            0.0001, audioContext.currentTime + 0.5
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.55);

        index++;
    }

    beep();
    soundTimer = setInterval(beep, 700);
}

// =============================================
// RING ALARM
// =============================================

function ringAlarm(alarm) {
    if (!alarm) return;

    ringingAlarm = alarm;
    ringingId = alarm.id;

    $("ringTime").textContent = formatTime(alarm.time);
    $("ringName").textContent = alarm.name;
    $("ringOverlay").classList.add("show");

    if (alarm.sound === "music" && songs.length > 0) {
        if (currentSong < 0) {
            playSongAt(0);
        }

        const audio = $("audioPlayer");
        audio.currentTime = 0;
        audio.volume = 0.8;

        audio.play().catch(() => playTone("classic"));
    } else {
        playTone(alarm.sound);
    }

    if ("Notification" in window &&
        Notification.permission === "granted") {
        new Notification("NOVA Alarm", {
            body: `${alarm.name} is ringing.`,
            tag: "nova-alarm"
        });
    }
}

// =============================================
// CHECK ALARMS
// =============================================

let lastCheckedMinute = "";

function checkAlarms() {
    if (ringingAlarm) return;

    const now = new Date();

    const minuteKey =
        `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-` +
        `${now.getHours()}-${now.getMinutes()}`;

    if (minuteKey === lastCheckedMinute) return;
    lastCheckedMinute = minuteKey;

    const time =
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0");

    const today = now.getDay();

    const matched = alarms.find(alarm =>
        alarm.enabled &&
        alarm.time === time &&
        (alarm.days.length === 0 || alarm.days.includes(today))
    );

    if (!matched) return;

    ringAlarm(matched);

    if (matched.days.length === 0) {
        alarms = alarms.filter(a => a.id !== matched.id);
        saveAlarms();
    }
}

setInterval(checkAlarms, 500);

// =============================================
// STOP ALARM
// =============================================

function stopCurrentAlarm() {
    stopTone();

    clearTimeout(snoozeTimer);
    snoozeTimer = null;

    const audio = $("audioPlayer");
    audio.pause();

    $("ringOverlay").classList.remove("show");

    ringingAlarm = null;
    ringingId = null;
}

$("stopBtn").addEventListener("click", stopCurrentAlarm);

// =============================================
// SNOOZE
// =============================================

$("snoozeBtn").addEventListener("click", () => {
    if (!ringingAlarm) return;

    const alarm = ringingAlarm;
    stopTone();
    $("audioPlayer").pause();

    $("ringOverlay").classList.remove("show");

    const minutes = alarm.snooze || 5;

    ringingAlarm = null;
    ringingId = null;

    clearTimeout(snoozeTimer);

    snoozeTimer = setTimeout(() => {
        ringAlarm(alarm);
    }, minutes * 60 * 1000);
});

// =============================================
// NOTIFICATIONS
// =============================================

$("notifyBtn").addEventListener("click", async () => {
    if (!("Notification" in window)) {
        alert("Your browser does not support notifications.");
        return;
    }

    const permission = await Notification.requestPermission();

    alert(
        permission === "granted"
            ? "Notifications enabled!"
            : "Notification permission was not granted."
    );
});

// =============================================
// CITY SEARCH + GEOCODING API
// =============================================

async function searchCity() {
    const query = $("cityInput").value.trim();

    if (!query) {
        alert("Enter a city name.");
        return;
    }

    $("apiStatus").textContent = "Searching location...";

    try {
        const url =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;

        const response = await fetch(url);

        if (!response.ok) throw new Error("Location API failed");

        const data = await response.json();

        if (!data.results || !data.results.length) {
            throw new Error("City not found");
        }

        const place = data.results[0];

        city = place.name;
        currentCoords = {
            latitude: place.latitude,
            longitude: place.longitude,
            timezone: place.timezone
        };

        $("cityName").textContent =
            [place.name, place.admin1, place.country]
                .filter(Boolean).join(", ");

        await loadEnvironment();

    } catch (error) {
        $("apiStatus").textContent = error.message;
    }
}

$("searchCity").addEventListener("click", searchCity);

$("cityInput").addEventListener("keydown", event => {
    if (event.key === "Enter") searchCity();
});

// =============================================
// WEATHER + AQI API
// =============================================

function weatherDescription(code) {
    const map = {
        0: ["Clear sky", "☀"],
        1: ["Mainly clear", "🌤"],
        2: ["Partly cloudy", "⛅"],
        3: ["Overcast", "☁"],
        45: ["Fog", "🌫"],
        48: ["Depositing rime fog", "🌫"],
        51: ["Light drizzle", "🌦"],
        53: ["Drizzle", "🌧"],
        55: ["Heavy drizzle", "🌧"],
        61: ["Slight rain", "🌧"],
        63: ["Moderate rain", "🌧"],
        65: ["Heavy rain", "🌧"],
        71: ["Slight snowfall", "❄"],
        73: ["Moderate snowfall", "❄"],
        75: ["Heavy snowfall", "❄"],
        80: ["Rain showers", "🌦"],
        81: ["Rain showers", "🌧"],
        82: ["Heavy rain showers", "🌧"],
        95: ["Thunderstorm", "⛈"]
    };

    return map[code] || ["Variable conditions", "☁"];
}

function aqiCategory(value) {
    if (value <= 20) return ["Good", "#48d6a0"];
    if (value <= 40) return ["Fair", "#a9d95d"];
    if (value <= 60) return ["Moderate", "#f2c15c"];
    if (value <= 80) return ["Poor", "#f39a54"];
    if (value <= 100) return ["Very Poor", "#ed6b66"];
    return ["Extremely Poor", "#b85cdb"];
}

async function loadEnvironment() {
    if (!currentCoords) return;

    $("apiStatus").textContent = "Fetching live weather and AQI...";

    const { latitude, longitude, timezone } = currentCoords;

    const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=${encodeURIComponent(timezone)}`;

    const aqiURL =
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm2_5,pm10&timezone=${encodeURIComponent(timezone)}`;

    try {
        const [weatherResponse, aqiResponse] = await Promise.all([
            fetch(weatherURL),
            fetch(aqiURL)
        ]);

        if (!weatherResponse.ok || !aqiResponse.ok) {
            throw new Error("One or more API services are unavailable.");
        }

        const [weatherData, aqiData] = await Promise.all([
            weatherResponse.json(),
            aqiResponse.json()
        ]);

        const w = weatherData.current;
        const a = aqiData.current;

        const [description, icon] = weatherDescription(w.weather_code);

        $("temperature").textContent =
            `${Math.round(w.temperature_2m)}°C`;

        $("humidity").textContent =
            `Humidity ${w.relative_humidity_2m}%`;

        $("weatherText").textContent = description;
        $("weatherIcon").textContent = icon;

        const index = a.european_aqi;

        if (index === null || index === undefined) {
            throw new Error("AQI data is currently unavailable.");
        }

        const [status, color] = aqiCategory(index);

        $("aqi").textContent = Math.round(index);
        $("aqiStatus").textContent = status;
        $("aqiStatus").style.color = color;

        $("aqiBar").style.width =
            `${Math.min(Math.max(index, 0), 100)}%`;

        $("aqiBar").style.background = color;

        $("pm25").textContent =
            `${a.pm2_5 ?? "--"} µg/m³`;

        $("pm10").textContent =
            `${a.pm10 ?? "--"} µg/m³`;

        $("apiStatus").textContent =
            `Updated: ${new Date().toLocaleTimeString()}`;

    } catch (error) {
        $("apiStatus").textContent = error.message;
        console.error("Environment API:", error);
    }
}

$("refreshWeather").addEventListener("click", loadEnvironment);

// Initial city search
searchCity();

// Refresh data every 15 minutes
setInterval(loadEnvironment, 15 * 60 * 1000);

// =============================================
// MUSIC PLAYER
// =============================================

const audio = $("audioPlayer");

$("uploadBtn").addEventListener("click", () => {
    $("songInput").click();
});

$("songInput").addEventListener("change", event => {
    const files = [...event.target.files];

    files.forEach(file => {
        if (!file.type.startsWith("audio/")) return;

        songs.push({
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: URL.createObjectURL(file)
        });
    });

    if (currentSong === -1 && songs.length > 0) {
        playSongAt(0);
    }

    renderPlaylist();
    event.target.value = "";
});

function playSongAt(index) {
    if (!songs.length) return;

    currentSong = (index + songs.length) % songs.length;

    audio.src = songs[currentSong].url;
    audio.load();

    $("songTitle").textContent = songs[currentSong].name;
    $("songArtist").textContent = `Track ${currentSong + 1} of ${songs.length}`;

    audio.play()
        .then(() => {
            $("playSong").textContent = "Ⅱ";
        })
        .catch(error => {
            console.error("Audio playback:", error);
            $("playSong").textContent = "▶";
        });

    renderPlaylist();
}

function renderPlaylist() {
    const list = $("playlist");
    list.innerHTML = "";

    if (!songs.length) {
        list.textContent = "Your playlist is empty.";
        list.className = "playlist muted";
        return;
    }

    list.className = "playlist";

    songs.forEach((song, index) => {
        const row = document.createElement("div");
        row.className = `song-item ${index === currentSong ? "active" : ""}`;

        const name = document.createElement("span");
        name.textContent = `${index + 1}. ${song.name}`;

        const controls = document.createElement("div");

        const play = document.createElement("button");
        play.textContent = "▶";
        play.addEventListener("click", () => playSongAt(index));

        const remove = document.createElement("button");
        remove.textContent = "×";
        remove.addEventListener("click", () => {
            URL.revokeObjectURL(songs[index].url);

            const wasCurrent = currentSong === index;

            if (wasCurrent) {
                audio.pause();
                audio.removeAttribute("src");
            }

            songs.splice(index, 1);

            if (!songs.length) {
                currentSong = -1;
                $("songTitle").textContent = "No song selected";
                $("songArtist").textContent = "Add your music collection";
                $("playSong").textContent = "▶";
            } else if (wasCurrent) {
                currentSong = -1;
                playSongAt(Math.min(index, songs.length - 1));
            } else if (index < currentSong) {
                currentSong--;
            }

            renderPlaylist();
        });

        controls.append(play, remove);
        row.append(name, controls);
        list.appendChild(row);
    });
}

$("playSong").addEventListener("click", () => {
    if (!songs.length) {
        alert("Please upload a music file first.");
        return;
    }

    if (audio.paused) {
        if (currentSong === -1) {
            playSongAt(0);
        } else {
            audio.play().catch(console.error);
        }
    } else {
        audio.pause();
    }
});

$("nextSong").addEventListener("click", () => {
    if (songs.length) playSongAt(currentSong + 1);
});

$("prevSong").addEventListener("click", () => {
    if (songs.length) playSongAt(currentSong - 1);
});

audio.addEventListener("play", () => {
    $("playSong").textContent = "Ⅱ";
});

audio.addEventListener("pause", () => {
    $("playSong").textContent = "▶";
});

audio.addEventListener("ended", () => {
    if (songs.length) playSongAt(currentSong + 1);
});

function timeText(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);

    return `${min}:${String(sec).padStart(2, "0")}`;
}

audio.addEventListener("timeupdate", () => {
    $("currentTime").textContent = timeText(audio.currentTime);

    if (audio.duration) {
        $("duration").textContent = timeText(audio.duration);
        $("seekBar").value =
            (audio.currentTime / audio.duration) * 100;
    }
});

audio.addEventListener("loadedmetadata", () => {
    $("duration").textContent = timeText(audio.duration);
});

$("seekBar").addEventListener("input", () => {
    if (audio.duration) {
        audio.currentTime =
            (Number($("seekBar").value) / 100) * audio.duration;
    }
});

$("volume").addEventListener("input", () => {
    audio.volume = Number($("volume").value) / 100;
});

audio.volume = 0.7;

// =============================================
// INITIALIZE
// =============================================

renderAlarms();
updateStats();
