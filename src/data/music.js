export const MUSIC_TRACKS = [
  {
    id: 'himalaya',
    name: 'Himalayan Dawn',
    short: 'Nepali',
    note: 'Nepali folk-inspired · madal, bansuri, open fifths',
    bpm: 82,
  },
  {
    id: 'raag',
    name: 'Dusk Raag',
    short: 'Hindi',
    note: 'Hindustani-inspired · tanpura, sitar, tabla',
    bpm: 70,
  },
]

export const DEFAULT_MUSIC_TRACK = MUSIC_TRACKS[0].id

export const getMusicTrack = (id) =>
  MUSIC_TRACKS.find((track) => track.id === id) || MUSIC_TRACKS[0]
