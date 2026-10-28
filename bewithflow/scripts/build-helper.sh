#!/bin/sh
# Builds the macOS key helper as a universal binary (Intel + Apple Silicon).
set -e
cd "$(dirname "$0")/.."
OUT=native/mac/build
mkdir -p "$OUT"
for ARCH in x86_64 arm64; do
  swiftc -O -swift-version 5 -target "$ARCH-apple-macos11" native/mac/keyhook.swift -o "$OUT/bwf-keyhook-$ARCH"
done
lipo -create "$OUT/bwf-keyhook-x86_64" "$OUT/bwf-keyhook-arm64" -output "$OUT/bwf-keyhook"
rm "$OUT/bwf-keyhook-x86_64" "$OUT/bwf-keyhook-arm64"
lipo -info "$OUT/bwf-keyhook"
