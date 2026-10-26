// Free Dictionary API: https://dictionaryapi.dev/
const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// DOM references
const form = document.getElementById("search-form");
const input = document.getElementById("word-input");
const statusEl = document.getElementById("status");
const resultsSection = document.getElementById("results");
const wordEl = document.getElementById("result-word");
const phoneticEl = document.getElementById("result-phonetic");
const meaningsEl = document.getElementById("meanings");
const audioBtn = document.getElementById("audio-btn");
const audioPlayer = document.getElementById("audio-player");
let activeRequest;

/* ---------- Fetching ---------- */

async function fetchWord(word) {
  const response = await fetch(API_URL + encodeURIComponent(word), {
    signal: activeRequest.signal,
  });

  if (response.status === 404) {
    throw new Error(`No definition found for "${word}". Check the spelling and try again.`);
  }
  if (!response.ok) {
    throw new Error("Something went wrong while contacting the dictionary. Please try again.");
  }
  const entries = await response.json();
  if (!Array.isArray(entries) || !entries.length) {
    throw new Error("The dictionary returned no usable result. Please try another word.");
  }
  return entries;
}

/* ---------- Parsing helpers ---------- */

// Find the first available phonetic text
function getPhonetic(entry) {
  if (entry.phonetic) return entry.phonetic;
  const withText = (entry.phonetics || []).find((p) => p.text);
  return withText ? withText.text : "";
}

// Find the first available audio URL
function getAudio(entry) {
  const withAudio = (entry.phonetics || []).find((p) => p.audio);
  return withAudio ? withAudio.audio : "";
}

// Collect synonyms from the meaning and from each definition
function getSynonyms(meaning) {
  const all = new Set(meaning.synonyms || []);
  (meaning.definitions || []).forEach((d) => (d.synonyms || []).forEach((s) => all.add(s)));
  return [...all];
}

/* ---------- Rendering ---------- */

function renderWord(entry) {
  wordEl.textContent = entry.word;
  phoneticEl.textContent = getPhonetic(entry) || "Pronunciation unavailable.";

  // Audio
  const audioSrc = getAudio(entry);
  if (audioSrc) {
    audioPlayer.src = audioSrc;
    audioBtn.hidden = false;
  } else {
    audioPlayer.removeAttribute("src");
    audioBtn.hidden = true;
  }

  // Meanings
  meaningsEl.innerHTML = "";
  const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];
  meanings.forEach((meaning) => {
    const block = document.createElement("div");
    block.className = "meaning";

    const pos = document.createElement("p");
    pos.className = "part-of-speech";
    pos.textContent = meaning.partOfSpeech;
    block.appendChild(pos);

    const list = document.createElement("ol");
    list.className = "definitions";
    (meaning.definitions || []).forEach((def) => {
      const li = document.createElement("li");
      li.textContent = def.definition;
      if (def.example) {
        const ex = document.createElement("span");
        ex.className = "example";
        ex.textContent = `"${def.example}"`;
        li.appendChild(ex);
      }
      list.appendChild(li);
    });
    block.appendChild(list);

    const synonyms = getSynonyms(meaning);
    const wrap = document.createElement("div");
    wrap.className = "synonyms";
    if (synonyms.length) {
      const label = document.createElement("strong");
      label.textContent = "Synonyms:";
      wrap.appendChild(label);

      synonyms.forEach((syn) => {
        const chip = document.createElement("span");
        chip.className = "synonym-chip";
        chip.textContent = syn;
        wrap.appendChild(chip);
      });
    } else {
      wrap.textContent = "No synonyms available.";
    }
    block.appendChild(wrap);

    meaningsEl.appendChild(block);
  });

  if (!meanings.length) {
    meaningsEl.textContent = "No definitions are available for this word.";
  }

  resultsSection.hidden = false;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

/* ---------- Event listeners ---------- */

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const word = input.value.trim();
  activeRequest?.abort();
  if (!word) {
    resultsSection.hidden = true;
    setStatus("Enter a word to search.", true);
    input.focus();
    return;
  }
  if (!/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u.test(word)) {
    resultsSection.hidden = true;
    setStatus("Use letters, spaces, apostrophes, or hyphens only.", true);
    input.focus();
    return;
  }

  activeRequest = new AbortController();
  resultsSection.hidden = true;
  setStatus("Searching...");

  try {
    const data = await fetchWord(word);
    renderWord(data[0]);
    setStatus("");
  } catch (error) {
    if (error.name !== "AbortError") setStatus(error.message, true);
  }
});

audioBtn.addEventListener("click", () => {
  audioPlayer.currentTime = 0;
  audioPlayer.play().catch(() => setStatus("Audio could not be played.", true));
});