# BDR

**Live:** https://ggps4.github.io/BDR/

A one-button website. One big red button that says **PRESS IF YOU DARE**. Press it and the Echo Plus plays *BIG DICK RANDY* by DigBar on Spotify.

## The rule

The button only works between **10:00 AM and 8:30 PM**, Eastern time. Outside those hours it's greyed out. The time comes from the home's time zone, not the visitor's phone, and it's checked again right before the song is sent.

## Setup

There's nothing to set up. The Spotify keys are loaded from the main [aux-control](https://github.com/GGPS4/aux-control) site's `config.js`, the same way [aux-pause](https://github.com/GGPS4/aux-pause) does, so when that gets re-run every ~6 months this page keeps working too.

If the Echo Plus has been idle and isn't showing up in Spotify, say "Alexa, play Spotify" once to wake it up.

Change the song, times, time zone or speaker in `config.js`:

```js
"trackUri": "spotify:track:7556LMF1GR5QawF5PHLjI7",
"speakerName": "Echo Plus",
"allowedStart": "10:00",
"allowedEnd": "20:30",
"timeZone": "America/New_York"
```

## Notes

- The time limit is enforced in the browser. It stops normal people, but someone who reads the source can get the same Spotify keys as aux-control. See the warning in that repo's README.
- To run it locally, serve the folder with any static server (`python3 -m http.server`).

```
index.html   the page and the button
app.js       the time check and the play call
style.css    styling
config.js    song, speaker name, allowed hours, time zone, where to load the Spotify keys from
```
