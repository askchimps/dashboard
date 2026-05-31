#!/usr/bin/env bash
# Fetch the dev-only sample recording used by the Calls page seed data.
# Run once after cloning. Not committed because the MP3 is ~9 MB.
set -euo pipefail
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/sample-recording.mp3"
URL="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
if [[ -f "$DEST" ]]; then
  echo "already present: $DEST"
  exit 0
fi
echo "fetching $URL → $DEST"
curl -sSL --max-time 60 -o "$DEST" "$URL"
echo "ok ($(wc -c < "$DEST") bytes)"
