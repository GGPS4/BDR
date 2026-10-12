(() => {
  const B = window.BDR_CONFIG || {};
  const A = window.AUX_CONFIG || {};                 // Spotify keys from the main aux-control site
  if (A.keys) { // aux-control stores them scrambled; unscramble the same way it does
    try {
      const k = "aux-control", b = atob(A.keys.split("").reverse().join(""));
      Object.assign(A, JSON.parse(decodeURIComponent(escape([...b].map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ k.charCodeAt(i % k.length))).join("")))));
    } catch { /* fall through to "not set up" */ }
  }
  const KEYS = { clientId: B.clientId || A.clientId, clientSecret: B.clientSecret || A.clientSecret, refreshToken: B.refreshToken || A.refreshToken };
  const TRACK = B.trackUri || "spotify:track:7556LMF1GR5QawF5PHLjI7"; // BIG DICK RANDY - DigBar
  const SPEAKER = B.speakerName || A.speakerName || "Echo Plus";
  const TZ = B.timeZone || "America/New_York";
  const START = B.allowedStart || "10:00";   // not before 10:00 AM
  const END = B.allowedEnd || "20:30";       // not after 8:30 PM
  const $ = (id) => document.getElementById(id);

  // ---------- the only rule: 10:00 AM to 8:30 PM, in the home's time zone (not the visitor's phone) ----------
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const nice = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };
  function nowMinutes() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
    const get = (t) => +parts.find((p) => p.type === t).value;
    return get("hour") * 60 + get("minute");
  }
  function allowedNow() {
    const now = nowMinutes();
    return now >= toMin(START) && now < toMin(END);
  }

  // ---------- Spotify (same approach as aux-control) ----------
  let token = null, tokenExp = 0, tokenP = null;
  function getToken() {
    if (token && Date.now() < tokenExp - 60000) return Promise.resolve(token);
    if (!tokenP) tokenP = fetchToken().finally(() => { tokenP = null; });
    return tokenP;
  }
  async function fetchToken() {
    if (!KEYS.clientId || !KEYS.refreshToken) throw new Error("This button isn't set up yet");
    const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: KEYS.refreshToken });
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    if (KEYS.clientSecret) headers.Authorization = "Basic " + btoa(KEYS.clientId + ":" + KEYS.clientSecret);
    else body.set("client_id", KEYS.clientId);
    const r = await fetch("https://accounts.spotify.com/api/token", { method: "POST", headers, body });
    const j = await r.json();
    if (!r.ok) throw new Error("Can't reach Spotify right now");
    token = j.access_token; tokenExp = Date.now() + j.expires_in * 1000;
    return token;
  }
  async function sp(path, opts = {}) {
    const t = await getToken();
    const r = await fetch("https://api.spotify.com/v1" + path, { cache: "no-store", ...opts,
      headers: { Authorization: "Bearer " + t, "Content-Type": "application/json", ...(opts.headers || {}) } });
    if (r.status === 204 || r.status === 202) return null;
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(j?.error?.message || r.statusText);
    return j;
  }

  // Find the Echo Plus in Spotify's device list (same match as aux-control).
  async function echoId() {
    const d = (await sp("/me/player/devices"))?.devices || [];
    const want = SPEAKER.toLowerCase();
    const pick = d.find((x) => x.name.toLowerCase().includes(want)) || d.find((x) => /echo|alexa/i.test(x.name));
    if (!pick) throw new Error(`The ${SPEAKER} is offline. Say "Alexa, play Spotify" once to wake it up`);
    return pick.id;
  }

  // ---------- UI ----------
  const toast = (msg) => {
    const t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 3500);
  };
  const setUp = !!(KEYS.clientId && KEYS.refreshToken);
  let busy = false, playedAt = 0;

  function render() {
    const ok = allowedNow();
    $("bdrBtn").disabled = !ok || !setUp || busy;
    let why;
    if (!setUp) why = "This button isn't set up yet";
    else if (!ok) why = `Randy rests. Only works from ${nice(START)} to ${nice(END)}`;
    else if (Date.now() - playedAt < 20000) why = "You dared. 🔊";
    else why = "Go on…";
    $("why").textContent = why;
  }

  $("bdrBtn").addEventListener("click", async () => {
    if (busy) return;
    // Re-check the time right before playing; never trust what was on screen.
    if (!allowedNow()) { render(); toast(`Not before ${nice(START)} or after ${nice(END)}`); return; }
    busy = true; render(); $("why").textContent = "Summoning Randy…";
    try {
      const id = await echoId();
      await sp("/me/player/play?device_id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ uris: [TRACK] }) });
      playedAt = Date.now();
      toast(`Playing on the ${SPEAKER} 🔊`);
    } catch (e) { toast(e.message); }
    busy = false;
    render();
  });

  render();
  setInterval(render, 15000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
})();
