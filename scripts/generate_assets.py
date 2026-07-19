from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

public_dir = Path(__file__).resolve().parent.parent / 'public'
public_dir.mkdir(parents=True, exist_ok=True)

def text_size(text, font, draw):
    if hasattr(draw, 'textbbox'):
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]
    if hasattr(font, 'getbbox'):
        bbox = font.getbbox(text)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]
    return font.getsize(text)

# Create logo.png
logo = Image.new('RGBA', (512, 512), (4, 7, 12, 255))
d = ImageDraw.Draw(logo)
d.ellipse((80, 80, 432, 432), fill=(221, 180, 47, 255))
d.ellipse((120, 120, 392, 392), fill=(4, 7, 12, 255))
try:
    font = ImageFont.truetype('arial.ttf', 180)
except IOError:
    font = ImageFont.load_default()
w, h = text_size('L', font, d)
d.text(((512 - w) / 2, (512 - h) / 2), 'L', font=font, fill=(255, 255, 255, 255))
logo.save(public_dir / 'logo.png')

# Create og-image.jpg
og = Image.new('RGB', (1200, 630), (4, 7, 12))
d2 = ImageDraw.Draw(og)
for i in range(0, 1200, 40):
    d2.line((i, 0, i, 630), fill=(20, 30, 50), width=1)
for j in range(0, 630, 40):
    d2.line((0, j, 1200, j), fill=(20, 30, 50), width=1)
try:
    font2 = ImageFont.truetype('arial.ttf', 64)
except IOError:
    font2 = ImageFont.load_default()
text = 'Lokaa Global Exports'
w, h = text_size(text, font2, d2)
d2.text(((1200 - w) / 2, 180), text, font=font2, fill=(221, 180, 47))
text2 = 'Connecting India’s finest to global markets'
w2, h2 = text_size(text2, font2, d2)
d2.text(((1200 - w2) / 2, 280), text2, font=font2, fill=(255, 255, 255))
og.save(public_dir / 'og-image.jpg', quality=90)

# Create favicon.ico
fav = Image.new('RGBA', (64, 64), (4, 7, 12, 255))
d3 = ImageDraw.Draw(fav)
d3.ellipse((8, 8, 56, 56), fill=(221, 180, 47, 255))
d3.rectangle((18, 18, 46, 46), fill=(4, 7, 12, 255))
fav.save(public_dir / 'favicon.ico')

print('Assets generated:', (public_dir / 'logo.png').exists(), (public_dir / 'og-image.jpg').exists(), (public_dir / 'favicon.ico').exists())
