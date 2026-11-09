#!/usr/bin/env bash
set -euo pipefail
rm -rf dist
mkdir -p dist/assets
cp index.html styles.css script.js manus-routes.json dist/
cp -R assets/. dist/assets/
