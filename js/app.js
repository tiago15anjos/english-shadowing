/* English Shadowing — main app. Vanilla JS, no build step.
 * Data lives in localStorage (progress, cards, settings) and IndexedDB (cached audio).
 */
(() => {
  "use strict";

  // ---------------------------------------------------------------- helpers
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const DAY = 24 * 60 * 60 * 1000;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(k, d) { try { const v = localStorage.getItem("es." + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("es." + k, JSON.stringify(v)); } catch (e) { toast("Não consegui salvar: " + e.message); } },
  };

  let toastTimer;
  function toast(msg, ms = 3500) {
    const t = $("#toast");
    t.innerHTML = msg;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), ms);
  }

  const dayKey = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

  // ---------------------------------------------------------------- settings
  const DEFAULT_SETTINGS = {
    apiKey: "", voiceId: "21m00Tcm4TlvDq8ikWAM", model: "eleven_multilingual_v2",
    slow: 0.75, autoAdd: true, pass: 80, showPt: false, hideText: false,
  };
  const PRESET_VOICES = [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (feminina, americana)" },
    { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (masculina, americana)" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (feminina, americana)" },
    { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam (masculina, americana)" },
    { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte (feminina)" },
  ];
  let settings = { ...DEFAULT_SETTINGS, ...store.get("settings", {}) };
  const saveSettingsObj = () => store.set("settings", settings);

  // ---------------------------------------------------------------- lessons
  const CUSTOM_ID = "custom";
  function customLesson() {
    const items = store.get("custom", []);
    return {
      id: CUSTOM_ID, number: "★", title: "Minhas frases", subtitle: "Frases que você mesmo adicionou",
      sections: [{ key: "custom", title: "Minhas frases", items }],
    };
  }
  const allLessons = () => [...window.LESSONS, customLesson()];
  const getLesson = (id) => allLessons().find((l) => l.id === id) || window.LESSONS[0];
  const sentenceId = (lessonId, sIdx, item, iIdx) => item.id || `${lessonId}-${sIdx}-${iIdx}`;
  function lessonSentences(lesson) {
    const out = [];
    lesson.sections.forEach((sec, sIdx) => sec.items.forEach((it, iIdx) => out.push({ ...it, sid: sentenceId(lesson.id, sIdx, it, iIdx), sIdx })));
    return out;
  }

  // Glossary (English word -> Portuguese) built from the lessons, for flashcards.
  const glossary = {};
  for (const l of window.LESSONS) {
    for (const v of l.verbs || []) {
      v.forms.replace(/\(.*?\)/g, "").split(/[,/]/).map((f) => f.trim().replace(/^to /, "").toLowerCase())
        .filter(Boolean).forEach((f) => { if (!glossary[f]) glossary[f] = v.pt; });
    }
    for (const s of l.sections) for (const it of s.items) if (it.word && it.wordPt) glossary[it.word.toLowerCase()] = it.wordPt;
  }

  // ---------------------------------------------------------------- state
  let pos = store.get("pos", { lesson: "l1", section: 0, index: 0 });
  let attempts = store.get("attempts", []); // {t, lesson, sid, target, said, score, missed}
  let cards = store.get("cards", []);       // {id, front, back, example, examplePt, box, due, created, lapses, reviews}

  const saveAttempts = () => store.set("attempts", attempts);
  const saveCards = () => { store.set("cards", cards); updateDueBadge(); };
  const savePos = () => store.set("pos", pos);

  // ---------------------------------------------------------------- audio cache (IndexedDB)
  const audioDB = (() => {
    let dbp;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open("es-audio", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("clips");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const tx = async (mode, fn) => {
      const db = await open();
      return new Promise((res, rej) => {
        const t = db.transaction("clips", mode);
        const req = fn(t.objectStore("clips"));
        t.oncomplete = () => res(req && req.result);
        t.onerror = () => rej(t.error);
      });
    };
    return {
      get: (k) => tx("readonly", (s) => s.get(k)),
      put: (k, v) => tx("readwrite", (s) => s.put(v, k)),
      count: () => tx("readonly", (s) => s.count()),
      clear: () => tx("readwrite", (s) => s.clear()),
    };
  })();

  // ---------------------------------------------------------------- text to speech
  let currentAudio = null;
  function stopAudio() {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    if (window.speechSynthesis) speechSynthesis.cancel();
  }

  async function elevenClip(text) {
    const key = `${settings.voiceId}|${settings.model}|${text}`;
    const cached = await audioDB.get(key).catch(() => null);
    if (cached) return cached;
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(settings.voiceId)}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": settings.apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: settings.model, voice_settings: { stability: 0.6, similarity_boost: 0.75 } }),
    });
    if (!resp.ok) {
      let detail = "";
      try { const j = await resp.json(); detail = j.detail?.message || j.detail?.status || JSON.stringify(j.detail || j); } catch {}
      throw new Error(`ElevenLabs ${resp.status} ${detail}`);
    }
    const blob = await resp.blob();
    await audioDB.put(key, blob).catch(() => {});
    refreshCacheInfo();
    return blob;
  }

  function playBlob(blob, rate = 1) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      a.playbackRate = rate;
      a.preservesPitch = true;
      currentAudio = a;
      a.onended = a.onerror = () => { URL.revokeObjectURL(url); resolve(); };
      a.play().catch(() => resolve());
    });
  }

  function browserSpeak(text, rate) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = rate;
      const voices = speechSynthesis.getVoices();
      const v = voices.find((x) => x.lang === "en-US" && /Google|Natural|Samantha/i.test(x.name)) || voices.find((x) => x.lang.startsWith("en"));
      if (v) u.voice = v;
      u.onend = u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }

  let warnedEleven = false;
  async function speak(text, slow = false) {
    stopAudio();
    if (settings.apiKey) {
      try {
        const blob = await elevenClip(text);
        return playBlob(blob, slow ? Number(settings.slow) : 1);
      } catch (e) {
        if (!warnedEleven) { toast(`Não consegui usar a ElevenLabs (${esc(e.message)}). Usando a voz do navegador.`, 6000); warnedEleven = true; }
      }
    }
    return browserSpeak(text, slow ? 0.7 : 0.95);
  }

  // ---------------------------------------------------------------- speech recognition + recording
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) $("#browserWarning").classList.remove("hidden");

  let micStream = null;
  let recognizing = null; // {rec, recorder, stop}
  let lastRecording = null; // Blob

  async function getMic() {
    if (micStream && micStream.active) return micStream;
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return micStream;
  }

  // Listens until the learner stops talking (or clicks again). Resolves with
  // { alternatives: [string], audio: Blob|null }.
  async function listen(onInterim) {
    if (!SR) throw new Error("no-speech-api");
    let recorder = null, chunks = [];
    try {
      const stream = await getMic();
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.start();
    } catch (e) { recorder = null; }

    return new Promise((resolve, reject) => {
      const rec = new SR();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      const segments = []; // per final result: [alt1, alt2, ...]
      let silenceTimer = null, heardSomething = false, error = null;

      const armSilence = (ms) => { clearTimeout(silenceTimer); silenceTimer = setTimeout(() => rec.stop(), ms); };
      armSilence(8000); // give up if nothing is said

      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) segments[i] = [...r].map((a) => a.transcript.trim());
          else interim += r[0].transcript;
        }
        heardSomething = true;
        const finalText = segments.filter(Boolean).map((s) => s[0]).join(" ");
        onInterim && onInterim((finalText + " " + interim).trim());
        armSilence(1800);
      };
      rec.onerror = (e) => { error = e.error; };
      rec.onend = () => {
        clearTimeout(silenceTimer);
        recognizing = null;
        const finish = () => {
          const audio = chunks.length ? new Blob(chunks, { type: recorder?.mimeType || "audio/webm" }) : null;
          if (error && error !== "no-speech" && error !== "aborted") return reject(new Error(error));
          resolve({ alternatives: combineSegments(segments.filter(Boolean)), audio, heard: heardSomething });
        };
        if (recorder && recorder.state !== "inactive") { recorder.onstop = finish; recorder.stop(); }
        else finish();
      };
      recognizing = { stop: () => rec.stop() };
      rec.start();
    });
  }

  // Build candidate transcripts from per-segment alternatives (kept small).
  function combineSegments(segs) {
    if (!segs.length) return [""];
    let combos = [""];
    for (const alts of segs) {
      const next = [];
      for (const c of combos) for (const a of alts.slice(0, 3)) next.push((c + " " + a).trim());
      combos = next.slice(0, 27);
    }
    return combos;
  }

  // ---------------------------------------------------------------- tabs
  function showTab(name) {
    $$(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.id === "tab-" + name));
    stopAudio();
    if (name === "flashcards") renderFlashcards();
    if (name === "progress") renderProgress();
    if (name === "settings") renderSettings();
    if (name === "shadowing") renderShadowing();
  }
  $$(".tab").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

  // ================================================================= SHADOWING
  function bestScores() {
    const best = {};
    for (const a of attempts) best[a.sid] = Math.max(best[a.sid] || 0, a.score);
    return best;
  }

  function lessonProgress(lesson, best = bestScores()) {
    const sents = lessonSentences(lesson);
    if (!sents.length) return { done: 0, total: 0, pct: 0 };
    const done = sents.filter((s) => (best[s.sid] || 0) >= settings.pass).length;
    return { done, total: sents.length, pct: Math.round((done / sents.length) * 100) };
  }

  function renderLessonList() {
    const best = bestScores();
    $("#lessonList").innerHTML = allLessons().map((l) => {
      const p = lessonProgress(l, best);
      return `<li class="${l.id === pos.lesson ? "active" : ""}" data-id="${l.id}">
        <div class="ll-title"><span class="ll-num">${esc(l.number)}</span> ${esc(l.title)}</div>
        <div class="bar"><div style="width:${p.pct}%"></div></div>
        <div class="muted small">${p.done}/${p.total} dominadas</div></li>`;
    }).join("");
    $$("#lessonList li").forEach((li) => li.addEventListener("click", () => {
      pos = { lesson: li.dataset.id, section: 0, index: 0 }; savePos(); renderShadowing();
    }));
  }

  function currentSection() {
    const lesson = getLesson(pos.lesson);
    const sec = lesson.sections[pos.section] || lesson.sections[0];
    return { lesson, sec };
  }
  function currentItem() {
    const { lesson, sec } = currentSection();
    const items = sec.items;
    if (!items.length) return null;
    pos.index = Math.max(0, Math.min(pos.index, items.length - 1));
    const it = items[pos.index];
    return { ...it, sid: sentenceId(lesson.id, pos.section, it, pos.index), lesson };
  }

  function renderShadowing() {
    renderLessonList();
    const { lesson, sec } = currentSection();
    if (!lesson.sections[pos.section]) pos.section = 0;

    // header + grammar box
    let header = `<h2>${lesson.id === CUSTOM_ID ? "" : `Lesson ${esc(lesson.number)} · `}${esc(lesson.title)}</h2><p class="muted">${esc(lesson.subtitle || "")}</p>`;
    if (lesson.grammarPt) {
      header += `<details class="card grammar"><summary>📖 Gramática e verbos da lição</summary>
        <p>${esc(lesson.grammarPt)}</p>
        ${lesson.verbs ? `<table class="table">${lesson.verbs.map((v) => `<tr><td><b>${esc(v.forms)}</b></td><td class="muted">${esc(v.pt)}</td></tr>`).join("")}</table>` : ""}
      </details>`;
    }
    $("#lessonHeader").innerHTML = header;

    // section chips
    const best = bestScores();
    $("#sectionChips").innerHTML = lesson.sections.map((s, i) => {
      const done = s.items.filter((it, j) => (best[sentenceId(lesson.id, i, it, j)] || 0) >= settings.pass).length;
      return `<button class="chip ${i === pos.section ? "active" : ""}" data-i="${i}">${esc(s.title)} <span class="muted">${done}/${s.items.length}</span></button>`;
    }).join("");
    $$("#sectionChips .chip").forEach((c) => c.addEventListener("click", () => { pos.section = +c.dataset.i; pos.index = 0; savePos(); renderShadowing(); }));

    // custom sentence editor
    const isCustom = lesson.id === CUSTOM_ID;
    $("#customEditor").classList.toggle("hidden", !isCustom);
    if (isCustom) renderCustomList();

    renderSentence();
  }

  function renderSentence() {
    const it = currentItem();
    const card = $("#sentenceCard");
    $("#result").classList.add("hidden");
    $("#liveTranscript").textContent = "";
    lastRecording = null;
    if (!it) {
      card.classList.add("empty");
      $("#targetText").innerHTML = `<span class="muted">Nenhuma frase ainda. Adicione a sua acima.</span>`;
      $("#targetPt").textContent = ""; $("#counter").textContent = "";
      return;
    }
    card.classList.remove("empty");
    const { sec } = currentSection();
    const best = bestScores()[it.sid];
    $("#counter").innerHTML = `Frase ${pos.index + 1} de ${sec.items.length}${best != null ? ` · melhor nota: <b>${best}%</b>` : ""}`;
    $("#targetText").innerHTML = wordSpans(it.en);
    $("#targetText").classList.toggle("blurred", settings.hideText);
    $("#targetPt").textContent = it.pt || "";
    $("#targetPt").classList.toggle("hidden", !settings.showPt || !it.pt);
    $("#toggleShowPt").checked = settings.showPt;
    $("#toggleHideText").checked = settings.hideText;
    bindWordClicks($("#targetText"), it);
  }

  function wordSpans(text, statuses) {
    return text.split(/\s+/).map((w, i) => {
      const cls = statuses ? statuses[i] : "";
      return `<span class="w ${cls}" data-w="${esc(w)}">${esc(w)}</span>`;
    }).join(" ");
  }

  function bindWordClicks(container, it) {
    $$(".w", container).forEach((s) => s.addEventListener("click", () => {
      const w = Compare.cleanToken(s.dataset.w);
      if (!w) return;
      const added = addCard(w, it.en, it.pt);
      toast(added ? `“${esc(w)}” foi para os flashcards.` : `“${esc(w)}” já está nos flashcards.`);
      speak(w);
    }));
  }

  async function doRecord() {
    if (recognizing) { recognizing.stop(); return; }
    const it = currentItem();
    if (!it) return;
    if (!SR) { toast("Use o Google Chrome para gravar."); return; }
    stopAudio();
    const btn = $("#btnRecord");
    btn.classList.add("recording"); btn.textContent = "⏹ Parar";
    $("#liveTranscript").textContent = "Pode falar…";
    $("#result").classList.add("hidden");
    try {
      const { alternatives, audio, heard } = await listen((t) => { $("#liveTranscript").textContent = t; });
      lastRecording = audio;
      if (!heard) { $("#liveTranscript").textContent = "Não ouvi nada. Verifique o microfone e tente de novo."; return; }
      const best = Compare.bestAlternative(it.en, alternatives);
      showResult(it, best.text, best.result);
    } catch (e) {
      const msg = e.message === "not-allowed" ? "O navegador bloqueou o microfone. Clique no cadeado da barra de endereço e permita o microfone."
        : e.message === "network" ? "O reconhecimento de voz do Chrome precisa de internet."
        : "Erro no reconhecimento: " + e.message;
      $("#liveTranscript").textContent = msg;
    } finally {
      btn.classList.remove("recording"); btn.textContent = "🎤 Gravar";
    }
  }

  function showResult(it, said, r) {
    $("#liveTranscript").textContent = "";
    const statuses = r.tokens.map((t) => t.status);
    $("#resultTarget").innerHTML = wordSpans(it.en, statuses);
    bindWordClicks($("#resultTarget"), it);
    $("#resultSaid").innerHTML = r.said.length ? r.said.map((s) => `<span class="${s.status === "extra" ? "extra" : ""}">${esc(s.text)}</span>`).join(" ") : "<i>(nada)</i>";
    const circle = $("#scoreCircle");
    circle.textContent = r.score + "%";
    circle.className = "score-circle " + (r.score >= 90 ? "great" : r.score >= settings.pass ? "good" : r.score >= 50 ? "ok" : "low");

    let missedHtml = "";
    if (r.missed.length) {
      missedHtml = `Palavras para treinar: ${r.missed.map((w) => `<button class="pill" data-w="${esc(w)}">🔊 ${esc(w)}</button>`).join(" ")}`;
      if (settings.autoAdd) {
        const added = r.missed.filter((w) => !COMMON_WORDS.has(w) && addCard(w, it.en, it.pt));
        if (added.length) missedHtml += `<div class="muted small">Enviadas para os flashcards: ${added.map(esc).join(", ")}</div>`;
      }
    } else missedHtml = r.score === 100 ? "Perfeito! 🎉" : "";
    $("#resultMissed").innerHTML = missedHtml;
    $$("#resultMissed .pill").forEach((b) => b.addEventListener("click", () => speak(b.dataset.w, true)));

    $("#btnMine").disabled = $("#btnCompare").disabled = !lastRecording;
    $("#result").classList.remove("hidden");

    attempts.push({ t: Date.now(), lesson: it.lesson.id, sid: it.sid, target: it.en, said, score: r.score, missed: r.missed });
    saveAttempts();
    renderLessonList();
    const { sec } = currentSection();
    const best = bestScores()[it.sid];
    $("#counter").innerHTML = `Frase ${pos.index + 1} de ${sec.items.length} · melhor nota: <b>${best}%</b>`;
  }

  function move(delta) {
    const { lesson, sec } = currentSection();
    let i = pos.index + delta;
    if (i >= sec.items.length) {
      if (pos.section < lesson.sections.length - 1) { pos.section++; pos.index = 0; savePos(); return renderShadowing(); }
      i = sec.items.length - 1;
    }
    if (i < 0) {
      if (pos.section > 0) { pos.section--; pos.index = lesson.sections[pos.section].items.length - 1; savePos(); return renderShadowing(); }
      i = 0;
    }
    pos.index = i; savePos(); stopAudio(); renderSentence();
  }

  $("#btnPlay").addEventListener("click", () => { const it = currentItem(); it && speak(it.en); });
  $("#btnSlow").addEventListener("click", () => { const it = currentItem(); it && speak(it.en, true); });
  $("#btnRecord").addEventListener("click", doRecord);
  $("#btnRetry").addEventListener("click", doRecord);
  $("#btnPrev").addEventListener("click", () => move(-1));
  $("#btnNext").addEventListener("click", () => move(1));
  $("#btnMine").addEventListener("click", () => { if (lastRecording) { stopAudio(); playBlob(lastRecording); } });
  $("#btnCompare").addEventListener("click", async () => {
    const it = currentItem(); if (!it || !lastRecording) return;
    await speak(it.en);
    await new Promise((r) => setTimeout(r, 400));
    await playBlob(lastRecording);
  });
  $("#toggleShowPt").addEventListener("change", (e) => { settings.showPt = e.target.checked; saveSettingsObj(); renderSentence(); });
  $("#toggleHideText").addEventListener("change", (e) => { settings.hideText = e.target.checked; saveSettingsObj(); renderSentence(); });

  document.addEventListener("keydown", (e) => {
    if (!$("#tab-shadowing").classList.contains("active")) return;
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
    if (e.code === "Space") { e.preventDefault(); $("#btnPlay").click(); }
    else if (e.key === "s" || e.key === "S") $("#btnSlow").click();
    else if (e.key === "r" || e.key === "R") doRecord();
    else if (e.key === "ArrowRight") move(1);
    else if (e.key === "ArrowLeft") move(-1);
  });

  // custom sentences
  function renderCustomList() {
    const items = store.get("custom", []);
    $("#customList").innerHTML = items.map((it) => `<li><span>${esc(it.en)}</span> <span class="muted">${esc(it.pt || "")}</span> <button class="link" data-id="${it.id}">remover</button></li>`).join("");
    $$("#customList .link").forEach((b) => b.addEventListener("click", () => {
      store.set("custom", store.get("custom", []).filter((x) => x.id !== b.dataset.id));
      pos.index = 0; renderShadowing();
    }));
  }
  $("#customAdd").addEventListener("click", () => {
    const en = $("#customEn").value.trim();
    if (!en) return toast("Escreva a frase em inglês.");
    const items = store.get("custom", []);
    items.push({ id: "c" + Date.now(), en, pt: $("#customPt").value.trim() });
    store.set("custom", items);
    $("#customEn").value = $("#customPt").value = "";
    pos.index = items.length - 1; savePos();
    renderShadowing();
    toast("Frase adicionada!");
  });

  // ================================================================= FLASHCARDS
  const INTERVALS = [0, 0, 1, 3, 7, 16, 35]; // days, by box (1..6)
  // Tiny words still count in "Meu Progresso", but don't become flashcards automatically.
  const COMMON_WORDS = new Set("a an the i i'm me my you you're your he he's his she she's her it it's its we we're our they they're their is am are was were be and or but of in on at that this".split(" "));

  function addCard(front, example = "", examplePt = "", back) {
    const f = front.trim().toLowerCase();
    if (!f || cards.some((c) => c.front.toLowerCase() === f)) return false;
    cards.push({
      id: "k" + Date.now() + Math.random().toString(36).slice(2, 6),
      front: front.trim(), back: back ?? (glossary[f] || ""), example, examplePt,
      box: 1, due: Date.now(), created: Date.now(), lapses: 0, reviews: 0,
    });
    saveCards();
    return true;
  }

  const dueCards = () => cards.filter((c) => c.due <= Date.now()).sort((a, b) => a.due - b.due);

  function updateDueBadge() {
    const n = dueCards().length;
    const b = $("#dueBadge");
    b.textContent = n; b.classList.toggle("hidden", !n);
  }

  let fcFlipped = false;
  function renderFlashcards() {
    const due = dueCards();
    $("#fcStats").textContent = `${due.length} para revisar hoje · ${cards.length} no total`;
    $("#fcCount").textContent = cards.length;
    const box = $("#fcReview");
    if (!cards.length) {
      box.innerHTML = `<p class="muted">Ainda não há cartões. Eles aparecem quando você erra palavras no Shadowing, quando clica numa palavra da frase, ou quando cria um aqui embaixo.</p>`;
    } else if (!due.length) {
      const next = cards.reduce((m, c) => Math.min(m, c.due), Infinity);
      box.innerHTML = `<p class="big">✅ Tudo revisado por hoje!</p><p class="muted">Próxima revisão: ${new Date(next).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>`;
    } else {
      const c = due[0];
      box.innerHTML = `
        <div class="fc-front">${esc(c.front)} <button class="btn small" id="fcSpeak">🔊</button> <button class="btn small" id="fcSpeakSlow">🐢</button></div>
        ${c.example ? `<div class="fc-example">“${esc(c.example)}” <button class="link" id="fcSpeakEx">🔊 ouvir frase</button></div>` : ""}
        <div id="fcBack" class="${fcFlipped ? "" : "hidden"}">
          <hr>
          ${c.back ? `<div class="fc-back">${esc(c.back)}</div>` : `<div class="muted">Sem tradução ainda. Escreva o significado:</div>`}
          <input id="fcEditBack" type="text" value="${esc(c.back)}" placeholder="significado em português">
          ${c.examplePt ? `<div class="muted">${esc(c.examplePt)}</div>` : ""}
          <div class="controls">
            <button class="btn danger" id="fcWrong">✗ Errei</button>
            <button class="btn" id="fcHard">≈ Difícil</button>
            <button class="btn primary" id="fcRight">✓ Acertei</button>
          </div>
        </div>
        ${fcFlipped ? "" : `<div class="controls"><button class="btn primary" id="fcFlip">Mostrar resposta</button></div>`}
        <p class="muted small">Caixa ${c.box} de 6 · fale a palavra em voz alta antes de virar.</p>`;
      $("#fcSpeak").onclick = () => speak(c.front);
      $("#fcSpeakSlow").onclick = () => speak(c.front, true);
      if ($("#fcSpeakEx")) $("#fcSpeakEx").onclick = () => speak(c.example);
      if ($("#fcFlip")) $("#fcFlip").onclick = () => { fcFlipped = true; renderFlashcards(); };
      if (fcFlipped) {
        const grade = (g) => {
          const nb = $("#fcEditBack").value.trim();
          if (nb !== c.back) c.back = nb;
          c.reviews++;
          if (g === "wrong") { c.box = 1; c.lapses++; c.due = Date.now() + 60 * 1000; }
          else if (g === "hard") { c.due = Date.now() + Math.max(INTERVALS[c.box], 0.5) * DAY; }
          else { c.box = Math.min(6, c.box + 1); c.due = Date.now() + INTERVALS[c.box] * DAY + (INTERVALS[c.box] ? 0 : 10 * 60 * 1000); }
          fcFlipped = false; saveCards(); renderFlashcards();
        };
        $("#fcWrong").onclick = () => grade("wrong");
        $("#fcHard").onclick = () => grade("hard");
        $("#fcRight").onclick = () => grade("right");
      }
    }
    renderCardTable();
  }

  function renderCardTable() {
    const rows = [...cards].sort((a, b) => b.created - a.created);
    $("#fcTable").innerHTML = `<tr><th>Inglês</th><th>Português</th><th>Caixa</th><th></th></tr>` + rows.map((c) =>
      `<tr><td>${esc(c.front)}</td><td><input class="inline-edit" data-id="${c.id}" value="${esc(c.back)}"></td><td>${c.box}</td><td><button class="link" data-del="${c.id}">apagar</button></td></tr>`).join("");
    $$("#fcTable .inline-edit").forEach((inp) => inp.addEventListener("change", () => {
      const c = cards.find((x) => x.id === inp.dataset.id); if (c) { c.back = inp.value.trim(); saveCards(); }
    }));
    $$("#fcTable [data-del]").forEach((b) => b.addEventListener("click", () => {
      cards = cards.filter((x) => x.id !== b.dataset.del); saveCards(); renderFlashcards();
    }));
  }

  $("#fcNewAdd").addEventListener("click", () => {
    const f = $("#fcNewFront").value.trim();
    if (!f) return toast("Escreva a palavra em inglês.");
    if (!addCard(f, $("#fcNewExample").value.trim(), "", $("#fcNewBack").value.trim())) return toast("Esse cartão já existe.");
    $("#fcNewFront").value = $("#fcNewBack").value = $("#fcNewExample").value = "";
    toast("Cartão criado!"); renderFlashcards();
  });

  // ================================================================= PROGRESS
  function renderProgress() {
    const now = Date.now();
    const avg = (arr) => arr.length ? Math.round(arr.reduce((s, a) => s + a.score, 0) / arr.length) : null;
    const last7 = attempts.filter((a) => a.t > now - 7 * DAY);
    const prev7 = attempts.filter((a) => a.t <= now - 7 * DAY && a.t > now - 14 * DAY);
    const days = new Set(attempts.map((a) => dayKey(a.t)));
    let streak = 0; for (let d = new Date(); days.has(dayKey(d)); d.setDate(d.getDate() - 1)) streak++;
    if (!streak) { const y = new Date(); y.setDate(y.getDate() - 1); for (; days.has(dayKey(y)); y.setDate(y.getDate() - 1)) streak++; }
    const mastered = Object.values(bestScores()).filter((s) => s >= settings.pass).length;
    const a7 = avg(last7), p7 = avg(prev7);
    const trend = a7 != null && p7 != null ? (a7 - p7 >= 0 ? `<span class="up">▲ ${a7 - p7}</span>` : `<span class="down">▼ ${p7 - a7}</span>`) + " vs semana anterior" : "";

    const tiles = [
      ["Gravações", attempts.length, ""],
      ["Frases dominadas", mastered, `nota ≥ ${settings.pass}%`],
      ["Média (7 dias)", a7 != null ? a7 + "%" : "–", trend],
      ["Dias seguidos", streak, streak ? "🔥" : "pratique hoje!"],
      ["Cartões para revisar", dueCards().length, `${cards.length} no total`],
    ];
    $("#statTiles").innerHTML = tiles.map(([l, v, s]) => `<div class="tile"><div class="tile-v">${v}</div><div class="tile-l">${l}</div><div class="tile-s muted">${s}</div></div>`).join("");

    renderChart();

    // most missed words: misses / times the word appeared in an attempted target
    const missCount = {}, seenCount = {};
    for (const a of attempts) {
      const seen = new Set(a.target.split(/\s+/).map(Compare.cleanToken).filter(Boolean));
      seen.forEach((w) => (seenCount[w] = (seenCount[w] || 0) + 1));
      (a.missed || []).forEach((w) => (missCount[w] = (missCount[w] || 0) + 1));
    }
    const ranking = Object.entries(missCount).sort((a, b) => b[1] - a[1] || (b[1] / seenCount[b[0]]) - (a[1] / seenCount[a[0]])).slice(0, 15);
    $("#missedTable").innerHTML = ranking.length
      ? `<tr><th>Palavra</th><th>Erros</th><th>Taxa</th><th></th></tr>` + ranking.map(([w, n]) =>
          `<tr><td><b>${esc(w)}</b></td><td>${n}</td><td>${Math.round((n / (seenCount[w] || n)) * 100)}%</td><td><button class="link" data-say="${esc(w)}">🔊</button></td></tr>`).join("")
      : `<tr><td class="muted">Ainda sem dados. Grave algumas frases no Shadowing.</td></tr>`;
    $$("#missedTable [data-say]").forEach((b) => b.addEventListener("click", () => speak(b.dataset.say, true)));

    const best = bestScores();
    $("#lessonTable").innerHTML = `<tr><th>Lição</th><th>Dominadas</th><th>Melhor média</th></tr>` + allLessons().map((l) => {
      const sents = lessonSentences(l);
      const p = lessonProgress(l, best);
      const scored = sents.filter((s) => best[s.sid] != null);
      const m = scored.length ? Math.round(scored.reduce((s, x) => s + best[x.sid], 0) / scored.length) + "%" : "–";
      return `<tr><td>${esc(l.number)}. ${esc(l.title)}</td><td>${p.done}/${p.total}</td><td>${m}</td></tr>`;
    }).join("");
  }

  function renderChart() {
    const byDay = {};
    for (const a of attempts) (byDay[dayKey(a.t)] ||= []).push(a.score);
    const pts = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = dayKey(d), arr = byDay[k];
      pts.push({ k, label: `${d.getDate()}/${d.getMonth() + 1}`, v: arr ? arr.reduce((s, x) => s + x, 0) / arr.length : null, n: arr ? arr.length : 0 });
    }
    if (!pts.some((p) => p.v != null)) { $("#scoreChart").innerHTML = `<p class="muted">O gráfico aparece depois das primeiras gravações.</p>`; return; }
    const W = 640, H = 200, L = 34, R = 22, T = 10, B = 26;
    const x = (i) => L + (i * (W - L - R)) / (pts.length - 1);
    const y = (v) => T + (1 - v / 100) * (H - T - B);
    let grid = "";
    for (const g of [0, 50, 80, 100]) grid += `<line x1="${L}" x2="${W - R}" y1="${y(g)}" y2="${y(g)}" class="grid"/><text x="${L - 6}" y="${y(g) + 4}" class="axis" text-anchor="end">${g}</text>`;
    let path = "", dots = "", started = false;
    pts.forEach((p, i) => {
      if (p.v == null) return;
      path += `${started ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)} `; started = true;
      dots += `<circle cx="${x(i)}" cy="${y(p.v)}" r="4" class="dot"><title>${p.label}: ${Math.round(p.v)}% (${p.n} gravações)</title></circle>`;
    });
    let labels = "";
    pts.forEach((p, i) => { if (i % 5 === 4 || i === 0) labels += `<text x="${x(i)}" y="${H - 6}" class="axis" text-anchor="middle">${p.label}</text>`; });
    $("#scoreChart").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pontuação média por dia">${grid}<path d="${path}" class="line"/>${dots}${labels}</svg>`;
  }

  // ================================================================= SETTINGS
  function fillVoiceSelect(list) {
    const sel = $("#setVoice");
    const all = [...list];
    if (!all.some((v) => v.id === settings.voiceId)) all.unshift({ id: settings.voiceId, name: settings.voiceName || settings.voiceId });
    sel.innerHTML = all.map((v) => `<option value="${esc(v.id)}">${esc(v.name)}</option>`).join("");
    sel.value = settings.voiceId;
  }

  async function refreshCacheInfo() {
    const n = await audioDB.count().catch(() => 0);
    const el = $("#cacheInfo"); if (el) el.textContent = `${n} áudio(s) guardado(s) neste navegador.`;
  }

  function renderSettings() {
    $("#setKey").value = settings.apiKey;
    fillVoiceSelect(store.get("voices", PRESET_VOICES));
    $("#setModel").value = settings.model;
    $("#setSlow").value = String(settings.slow);
    $("#setAutoAdd").checked = settings.autoAdd;
    $("#setPass").value = String(settings.pass);
    refreshCacheInfo();
  }

  function readSettingsForm() {
    settings.apiKey = $("#setKey").value.trim();
    settings.voiceId = $("#setVoice").value;
    settings.voiceName = $("#setVoice").selectedOptions[0]?.textContent;
    settings.model = $("#setModel").value;
    settings.slow = Number($("#setSlow").value);
    settings.autoAdd = $("#setAutoAdd").checked;
    settings.pass = Number($("#setPass").value);
    warnedEleven = false;
    saveSettingsObj();
  }

  $("#saveSettings").addEventListener("click", () => { readSettingsForm(); toast("Configurações salvas."); });
  $("#setAutoAdd").addEventListener("change", readSettingsForm);
  $("#setPass").addEventListener("change", readSettingsForm);
  $("#testVoice").addEventListener("click", () => { readSettingsForm(); speak("Hi Tiago! This is how I sound. Let's practice together."); });
  $("#loadVoices").addEventListener("click", async () => {
    const key = $("#setKey").value.trim();
    if (!key) return toast("Cole sua chave da ElevenLabs primeiro.");
    try {
      const r = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": key } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const list = (j.voices || []).map((v) => ({ id: v.voice_id, name: `${v.name}${v.labels?.accent ? " (" + v.labels.accent + ")" : ""}` }));
      if (!list.length) throw new Error("nenhuma voz");
      store.set("voices", list); fillVoiceSelect(list);
      toast(`${list.length} vozes carregadas.`);
    } catch (e) { toast("Não consegui carregar as vozes: " + esc(e.message)); }
  });
  $("#clearCache").addEventListener("click", async () => {
    if (!confirm("Apagar todos os áudios guardados? Eles serão gerados de novo (gastando créditos) quando você ouvir.")) return;
    await audioDB.clear(); refreshCacheInfo(); toast("Áudios apagados.");
  });

  $("#exportData").addEventListener("click", () => {
    const data = { app: "english-shadowing", version: 1, exported: new Date().toISOString(), attempts, cards, custom: store.get("custom", []), pos };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = `english-shadowing-backup-${dayKey(Date.now())}.json`;
    a.click();
  });
  $("#importData").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (d.app !== "english-shadowing") throw new Error("arquivo não reconhecido");
      attempts = d.attempts || []; cards = d.cards || [];
      store.set("custom", d.custom || []); if (d.pos) pos = d.pos;
      saveAttempts(); saveCards(); savePos();
      toast("Backup importado!"); renderSettings();
    } catch (err) { toast("Não consegui importar: " + esc(err.message)); }
    e.target.value = "";
  });
  $("#resetData").addEventListener("click", () => {
    if (!confirm("Apagar TODO o progresso, cartões e frases suas? (A chave e os áudios continuam.)")) return;
    attempts = []; cards = []; store.set("custom", []); pos = { lesson: "l1", section: 0, index: 0 };
    saveAttempts(); saveCards(); savePos(); toast("Progresso apagado.");
  });

  // ---------------------------------------------------------------- boot
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};
  updateDueBadge();
  renderShadowing();
})();
