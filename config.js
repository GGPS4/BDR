// Settings for the BDR button.
window.BDR_CONFIG = {
  // Spotify keys are read from the main aux-control site, so there's only one place to
  // update them when you re-run setup.html every ~6 months.
  "auxConfigUrl": "https://ggps4.github.io/aux-control/config.js",

  // The song: BIG DICK RANDY by DigBar
  "trackUri": "spotify:track:7556LMF1GR5QawF5PHLjI7",

  // It only plays on this speaker...
  "speakerName": "Echo Plus",
  // ...and only between these times (24-hour clock, in this time zone).
  // Not before 10:00 AM, not after 8:30 PM.
  "allowedStart": "10:00",
  "allowedEnd": "20:30",
  "timeZone": "America/New_York"
};
