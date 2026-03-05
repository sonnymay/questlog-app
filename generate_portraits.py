#!/usr/bin/env python3
"""
generate_portraits.py

Generates 1,800 RPG character portraits (gender × class × level 1-100)
using Google Gemini Imagen 3 and uploads them to Supabase Storage.

Required environment variables:
  GEMINI_API_KEY         — Google AI Studio API key
  SUPABASE_URL           — Your Supabase project URL
  SUPABASE_SERVICE_KEY   — Supabase service role key (not anon key)

Usage:
  pip install google-genai supabase pillow
  python generate_portraits.py

The script is fully resumable: it skips any path that already exists
in the Supabase bucket.
"""

import os
import time
import io
import sys
from pathlib import Path

# ── Dependencies check ────────────────────────────────────────────────────────
try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    print("ERROR: Install google-genai:  pip install google-genai")
    sys.exit(1)

try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: Install supabase:  pip install supabase")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────

GEMINI_API_KEY       = os.environ.get("GEMINI_API_KEY", "")
SUPABASE_URL         = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
BUCKET_NAME          = "character-portraits"
IMAGEN_MODEL         = "imagen-3.0-generate-001"

RATE_LIMIT_SECONDS   = 1.0   # Delay between API calls
MAX_RETRIES          = 3     # Retries per image on API error
RETRY_DELAY_SECONDS  = 5.0   # Delay between retries

# ── Game constants ─────────────────────────────────────────────────────────────

GENDERS  = ["male", "female"]

CLASSES  = [
    "swordsman",
    "archer",
    "acolyte",
    "thief",
    "merchant",
    "mage",
    "assassin",
    "paladin",
    "bard",
]

def get_level_name(level: int) -> str:
    if level == 100: return "Transcendent"
    if level >= 91:  return "S-Rank"
    if level >= 81:  return "Legendary"
    if level >= 71:  return "Veteran"
    if level >= 61:  return "Elite"
    if level >= 51:  return "Warlord"
    if level >= 41:  return "Champion"
    if level >= 31:  return "Knight"
    if level >= 21:  return "Hunter"
    if level >= 11:  return "Scout"
    if level >= 6:   return "Apprentice"
    return "Novice"

# ── Prompt builder ─────────────────────────────────────────────────────────────

def build_prompt(gender: str, character_class: str, level: int) -> str:
    level_name = get_level_name(level)

    # Extra flavor for higher level tiers
    power_desc = {
        range(1,   6):  "simple worn equipment, humble beginnings",
        range(6,  11):  "basic gear with minor enchantments",
        range(11, 21):  "modest armor, determined expression",
        range(21, 31):  "quality equipment, battle-hardened look",
        range(31, 41):  "fine armor with decorative engravings",
        range(41, 51):  "enchanted equipment, glowing runes",
        range(51, 61):  "powerful aura, mastercraft weapons",
        range(61, 71):  "legendary gear, fierce battle aura",
        range(71, 81):  "ancient armor, radiant power emanating",
        range(81, 91):  "mythic equipment, elemental energy swirling",
        range(91, 100): "divine-tier armor, overwhelming aura of power",
    }

    equipment = "transcendent, beyond mortal comprehension, universe-bending power"
    for lvl_range, desc in power_desc.items():
        if level in lvl_range:
            equipment = desc
            break

    class_style = {
        "swordsman": "heavy armor, great sword, warrior stance",
        "archer":    "light leather armor, longbow, quiver of arrows, focused gaze",
        "acolyte":   "white robes with gold trim, holy staff, divine light",
        "thief":     "dark leather armor, daggers, hood shadowing face",
        "merchant":  "fine clothes, coin pouch, merchant's staff",
        "mage":      "flowing robes, arcane staff, magical grimoire, spell glow",
        "assassin":  "black assassin outfit, dual blades, shadows clinging to form",
        "paladin":   "shining plate armor, holy sword, shield with crest",
        "bard":      "colorful adventurer's outfit, lute instrument, charming smile",
    }.get(character_class, "adventurer gear")

    gender_desc = "male" if gender == "male" else "female"

    return (
        f"RPG character portrait, {gender_desc} {character_class}, "
        f"level {level} {level_name}, {class_style}, {equipment}, "
        f"dark fantasy style, Solo Leveling and Ragnarok Online inspired, "
        f"detailed digital illustration, dramatic lighting, "
        f"dark background with atmospheric fog, square format, "
        f"professional game art quality, face clearly visible, upper body shot"
    )

# ── Supabase helpers ───────────────────────────────────────────────────────────

def check_file_exists(supabase_client: Client, path: str) -> bool:
    """Return True if the file already exists in the bucket."""
    try:
        # List the directory to check if file exists
        folder = "/".join(path.split("/")[:-1])
        filename = path.split("/")[-1]
        result = supabase_client.storage.from_(BUCKET_NAME).list(folder)
        if isinstance(result, list):
            existing = [item["name"] for item in result if isinstance(item, dict)]
            return filename in existing
        return False
    except Exception:
        return False

def upload_image(supabase_client: Client, path: str, image_bytes: bytes) -> bool:
    """Upload PNG bytes to Supabase Storage. Returns True on success."""
    try:
        supabase_client.storage.from_(BUCKET_NAME).upload(
            path=path,
            file=image_bytes,
            file_options={
                "content-type": "image/png",
                "cache-control": "public, max-age=31536000",
                "upsert": "false",
            },
        )
        return True
    except Exception as e:
        print(f"    Upload error: {e}")
        return False

# ── Image generation ───────────────────────────────────────────────────────────

def generate_image(gemini_client, prompt: str) -> bytes | None:
    """Call Imagen 3 and return raw PNG bytes, or None on failure."""
    try:
        response = gemini_client.models.generate_images(
            model=IMAGEN_MODEL,
            prompt=prompt,
            config=genai_types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
                safety_filter_level="block_only_high",
                person_generation="allow_adult",
            ),
        )
        if response.generated_images:
            return response.generated_images[0].image.image_bytes
        return None
    except Exception as e:
        print(f"    Imagen API error: {e}")
        return None

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # Validate environment
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY is not set.")
        sys.exit(1)
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.")
        sys.exit(1)

    print("=" * 60)
    print("Quest Log — Portrait Generator")
    print(f"  Model:  {IMAGEN_MODEL}")
    print(f"  Bucket: {BUCKET_NAME}")
    print(f"  Total:  {len(GENDERS)} genders × {len(CLASSES)} classes × 100 levels = 1,800 portraits")
    print("=" * 60)

    # Init clients
    gemini_client   = genai.Client(api_key=GEMINI_API_KEY)
    supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # Ensure bucket exists (best effort)
    try:
        supabase_client.storage.create_bucket(
            BUCKET_NAME, options={"public": True}
        )
        print(f"Created bucket '{BUCKET_NAME}'.")
    except Exception:
        print(f"Bucket '{BUCKET_NAME}' already exists (or creation skipped).")

    # Build full task list
    total   = len(GENDERS) * len(CLASSES) * 100
    done    = 0
    skipped = 0
    failed  = 0

    print()

    for gender in GENDERS:
        for character_class in CLASSES:
            for level in range(1, 101):
                storage_path = f"{gender}/{character_class}/{level}.png"
                done += 1

                print(f"[{done:4d}/{total}] {storage_path}", end="  ", flush=True)

                # Skip if already uploaded
                if check_file_exists(supabase_client, storage_path):
                    print("SKIP (exists)")
                    skipped += 1
                    continue

                # Build prompt
                prompt = build_prompt(gender, character_class, level)

                # Generate with retries
                image_bytes = None
                for attempt in range(1, MAX_RETRIES + 1):
                    image_bytes = generate_image(gemini_client, prompt)
                    if image_bytes:
                        break
                    if attempt < MAX_RETRIES:
                        print(f"\n    Retry {attempt}/{MAX_RETRIES} in {RETRY_DELAY_SECONDS}s...")
                        time.sleep(RETRY_DELAY_SECONDS)

                if not image_bytes:
                    print("FAIL (generation)")
                    failed += 1
                    time.sleep(RATE_LIMIT_SECONDS)
                    continue

                # Upload
                if upload_image(supabase_client, storage_path, image_bytes):
                    print(f"OK  ({len(image_bytes):,} bytes)")
                else:
                    print("FAIL (upload)")
                    failed += 1

                # Rate limit
                time.sleep(RATE_LIMIT_SECONDS)

    print()
    print("=" * 60)
    print(f"Done! Generated: {done - skipped - failed}  Skipped: {skipped}  Failed: {failed}")
    print("=" * 60)

    if failed > 0:
        print(f"\nRe-run the script to retry {failed} failed portraits.")
        sys.exit(1)


if __name__ == "__main__":
    main()
