# Locomotive Images

This directory contains 200x200 PNG images for the mock roster locomotives.

## Required Images

Place the following images in this directory:

1. **CSX754.png** - CSX GP38-2 diesel locomotive (blue/yellow livery)
2. **UP3985.png** - Union Pacific 3985 Challenger 4-6-6-4 steam locomotive
3. **BNSF5240.png** - BNSF SD40-2 diesel locomotive (Heritage II paint)

## Finding Images on Wikimedia Commons

### CSX GP38-2
Search: https://commons.wikimedia.org/w/index.php?search=CSX+GP38&title=Special:MediaSearch&type=image
Look for: Side view of CSX locomotive in blue/yellow "YN2" livery

### Union Pacific 3985 Challenger
Search: https://commons.wikimedia.org/w/index.php?search=UP+3985+Challenger&title=Special:MediaSearch&type=image
Look for: Side view of the famous Union Pacific Challenger steam locomotive

### BNSF SD40-2
Search: https://commons.wikimedia.org/w/index.php?search=BNSF+SD40-2&title=Special:MediaSearch&type=image
Look for: Side view of BNSF diesel in orange/green "Heritage II" scheme

## Image Requirements

- Format: PNG
- Size: 200x200 pixels (or larger, will be scaled)
- Orientation: Side view preferred
- License: Public domain or CC-licensed from Wikimedia Commons

## Converting Images

If you download a JPEG or larger image, convert to 200x200 PNG using:

```bash
# macOS (using sips)
sips -s format png --resampleWidth 200 input.jpg --out CSX754.png

# Or using ImageMagick
convert input.jpg -resize 200x200 CSX754.png
```
