name: Refresh the service worker version

on:
  push:
    paths:
      - ".github/workflows/sw-bump.yml"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: sw-bump
  cancel-in-progress: false

jobs:
  bump-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Check out the repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Stamp a fresh version into public/sw.js
        shell: bash
        run: |
          echo 'IyAtKi0gY29kaW5nOiB1dGYtOCAtKi0KIiIiU3RhbXBzIGEgZnJlc2ggVkVSU0lPTiBpbnRvIHB1YmxpYy9zdy5qcyBzbyB0aGUgYnJvd3NlciBzZWVzIGEgbmV3CnNlcnZpY2Ugd29ya2VyIGFmdGVyIGV2ZXJ5IGRlcGxveSwgd2hpY2ggaXMgd2hhdCBtYWtlcyB0aGUKItmK2YjYrNivINiq2K3Yr9mK2Ksg2KzYr9mK2K8g2YTZhNiq2LfYqNmK2YIiIGJhbm5lciBhcHBlYXIuCgpUaGUgc3RhbXAgaXMgYnVpbHQgZnJvbSB0aGUgY29tbWl0IFNIQSBhbmQgdGhlIHdvcmtmbG93IHJ1biBudW1iZXIsIHNvOgogICogZXZlcnkgcmVhbCBjb2RlIGNoYW5nZSBwcm9kdWNlcyBhIGRpZmZlcmVudCBzdy5qcwogICogcmUtcnVubmluZyB0aGUgc2FtZSBqb2Igb3ZlciB0aGUgc2FtZSBjb21taXQgcHJvZHVjZXMgdGhlIHNhbWUKICAgIGJ5dGVzLCBzbyB0aGUgd29ya2Zsb3cgc3RheXMgaWRlbXBvdGVudCBhbmQgd2lsbCBub3QgY29tbWl0IHR3aWNlLgoiIiIKaW1wb3J0IGlvCmltcG9ydCBvcwppbXBvcnQgcmUKaW1wb3J0IHN5cwoKUEFUSCA9ICJwdWJsaWMvc3cuanMiCgpzaGEgPSAob3MuZW52aXJvbi5nZXQoIkdJVEhVQl9TSEEiKSBvciAibG9jYWwiKS5zdHJpcCgpWzo3XQpydW4gPSAob3MuZW52aXJvbi5nZXQoIkdJVEhVQl9SVU5fTlVNQkVSIikgb3IgIjAiKS5zdHJpcCgpCgpzdGFtcCA9ICJ2NC17cnVufS17c2hhfSIuZm9ybWF0KHJ1bj1ydW4sIHNoYT1zaGEpCgppZiBub3Qgb3MucGF0aC5leGlzdHMoUEFUSCk6CiAgICBzeXMuZXhpdCgiRVJST1I6ICIgKyBQQVRIICsgIiBkb2VzIG5vdCBleGlzdC4iKQoKd2l0aCBpby5vcGVuKFBBVEgsIGVuY29kaW5nPSJ1dGYtOCIpIGFzIGZoOgogICAgc3JjID0gZmgucmVhZCgpCgpvcmlnaW5hbCA9IHNyYwoKcGF0dGVybiA9IHJlLmNvbXBpbGUocideY29uc3QgVkVSU0lPTiA9ICJbXiJdKiI7JywgcmUuTSkKCmlmIG5vdCBwYXR0ZXJuLnNlYXJjaChzcmMpOgogICAgc3lzLmV4aXQoIkVSUk9SOiBjb3VsZCBub3QgZmluZCB0aGUgVkVSU0lPTiBsaW5lIGluICIgKyBQQVRIKQoKc3JjID0gcGF0dGVybi5zdWIoJ2NvbnN0IFZFUlNJT04gPSAiJyArIHN0YW1wICsgJyI7Jywgc3JjLCBjb3VudD0xKQoKaWYgc3JjID09IG9yaWdpbmFsOgogICAgcHJpbnQoIk5vIGNoYW5nZSBuZWVkZWQgLSBzdy5qcyBhbHJlYWR5IGNhcnJpZXMgIiArIHN0YW1wKQplbHNlOgogICAgd2l0aCBpby5vcGVuKFBBVEgsICJ3IiwgZW5jb2Rpbmc9InV0Zi04IikgYXMgZmg6CiAgICAgICAgZmgud3JpdGUoc3JjKQogICAgcHJpbnQoIk9LOiBzdy5qcyBWRVJTSU9OIC0+ICIgKyBzdGFtcCkK' | base64 --decode > /tmp/bump_sw.py
          python3 /tmp/bump_sw.py

      - name: Install dependencies
        run: npm install

      - name: Verify production build
        run: npm run build

      - name: Commit the tested change
        id: commit
        shell: bash
        run: |
          if git diff --quiet -- public/sw.js; then
            echo "No new changes to commit."
            echo "changed=false" >> "$GITHUB_OUTPUT"
            exit 0
          fi

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add public/sw.js
          git commit -m "Bump the service worker version so clients see the update banner"
          git push
          echo "changed=true" >> "$GITHUB_OUTPUT"

      - name: Trigger the Vercel production deploy
        if: steps.commit.outputs.changed == 'true'
        shell: bash
        env:
          HOOK: ${{ secrets.VERCEL_DEPLOY_HOOK }}
        run: |
          if [ -z "$HOOK" ]; then
            echo "::warning::VERCEL_DEPLOY_HOOK is not set - deploy manually from Vercel."
            exit 0
          fi

          code=$(curl -s -o /tmp/hook.txt -w "%{http_code}" -X POST "$HOOK")
          echo "HTTP $code"
          cat /tmp/hook.txt || true
          echo

          case "$code" in
            2*) echo "Vercel deployment triggered successfully." ;;
            *)  echo "::error::The deploy hook failed with HTTP $code."; exit 1 ;;
          esac
