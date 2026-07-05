import os
from PIL import Image

src = r"C:\Users\moham\.gemini\antigravity-ide\brain\ed1ad0a0-6ae6-41ed-802a-12cdbdc6aeb0\collabbridge_thumbnail_1783231647134.png"
dst = r"d:\Kaggle\Intensive Vibe Coding\Capstone Project\CollabBridge\submission\collabbridge_thumbnail.png"

try:
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img = Image.open(src)
    print(f"Original size: {img.size}")

    # The original image has a central dark card layout. Let's crop it to the card itself (which is approximately 2:1)
    # or crop the entire image to 2:1 and then scale down.
    # Let's crop the outer gradient borders to focus on the card if needed, or simply crop from center.
    # The card itself looks like it's centered. Let's check dimensions.
    # Since the image is 1024x1024, cropping from y=200 to y=800 and x=50 to x=974 would be a 924x600 region.
    # Let's crop to a 2:1 aspect ratio centered in the 1024x1024 image.
    w, h = img.size
    
    # 2:1 ratio
    target_w = 960
    target_h = 480
    
    left = (w - target_w) // 2
    top = (h - target_h) // 2
    right = left + target_w
    bottom = top + target_h
    
    cropped = img.crop((left, top, right, bottom))
    print(f"Cropped to: {cropped.size}")
    
    # Resize to exactly 560x280 with Lanczos
    resized = cropped.resize((560, 280), Image.Resampling.LANCZOS)
    print(f"Resized to: {resized.size}")
    
    resized.save(dst, "PNG", optimize=True)
    print("Successfully saved to destination!")
except Exception as e:
    print(f"Error: {e}")
