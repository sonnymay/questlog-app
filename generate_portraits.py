#!/usr/bin/env python3
"""
generate_portraits.py

Generates 1,800 RPG character portraits (2 genders × 9 classes × 100 levels)
using Google Imagen 3 and uploads them to Supabase Storage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTHENTICATION OPTIONS (pick one):

Option A — Google AI Studio key (requires Imagen enabled on your account):
  export GEMINI_API_KEY=AIza...
  export USE_VERTEX=false

Option B — Vertex AI (requires Google Cloud project + billing + Vertex AI API):
  export USE_VERTEX=true
  export GOOGLE_CLOUD_PROJECT=your-project-id
  export GOOGLE_CLOUD_LOCATION=us-central1   # or us-east4, europe-west4, etc.
  # Authenticate: gcloud auth application-default login

ALWAYS required:
  export SUPABASE_URL=https://xxx.supabase.co
  export SUPABASE_SERVICE_KEY=eyJ...

Install:
  pip install google-genai supabase

Run:
  python generate_portraits.py [--dry-run] [--gender male] [--class swordsman] [--level 1]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import os
import sys
import time
import argparse

# ── Dependencies check ────────────────────────────────────────────────────────
try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    sys.exit("ERROR: pip install google-genai")

try:
    from supabase import create_client
except ImportError:
    sys.exit("ERROR: pip install supabase")

# ── Config from env ───────────────────────────────────────────────────────────
GEMINI_API_KEY       = os.environ.get("GEMINI_API_KEY", "")
USE_VERTEX           = os.environ.get("USE_VERTEX", "false").lower() == "true"
GCP_PROJECT          = os.environ.get("GOOGLE_CLOUD_PROJECT", "")
GCP_LOCATION         = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
SUPABASE_URL         = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

BUCKET_NAME     = "character-portraits"
IMAGEN_MODEL    = "imagen-3.0-generate-001"
RATE_LIMIT_SEC  = 1.2   # seconds between API calls
MAX_RETRIES     = 3
RETRY_DELAY_SEC = 8.0

# ── Game data ─────────────────────────────────────────────────────────────────
GENDERS = ["male", "female"]

CLASSES = [
    "swordsman", "archer", "acolyte", "thief", "merchant",
    "mage", "assassin", "paladin", "bard",
]

CLASS_STYLE = {
    "swordsman": "heavy armor, great sword, warrior stance",
    "archer":    "light leather armor, longbow, quiver of arrows, focused gaze",
    "acolyte":   "white robes with gold trim, holy staff, divine light halo",
    "thief":     "dark leather armor, twin daggers, hood shadowing the face",
    "merchant":  "fine travelling clothes, coin pouch, ornate merchant staff",
    "mage":      "flowing magical robes, arcane staff with crystal orb, spell glow",
    "assassin":  "black assassin outfit, dual blades, shadows clinging to form",
    "paladin":   "shining plate armor, blessed sword, shield bearing holy crest",
    "bard":      "colorful adventurer outfit, lute instrument, charming expression",
}

def level_name(level: int) -> str:
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

TIER_EQUIPMENT = [
    (range(1,   6),  "simple worn equipment, humble beginnings, modest gear"),
    (range(6,  11),  "basic gear with minor rune engravings"),
    (range(11, 21),  "modest iron armor, battle-hardened look"),
    (range(21, 31),  "quality steel equipment, decorative accents"),
    (range(31, 41),  "fine enchanted armor with glowing runes"),
    (range(41, 51),  "master-crafted equipment, visible magical aura"),
    (range(51, 61),  "legendary gear, fierce battle aura surrounding body"),
    (range(61, 71),  "ancient armor with elemental energy crackling"),
    (range(71, 81),  "mythic equipment, radiant power emanating, glowing eyes"),
    (range(81, 91),  "divine-tier armor, overwhelming golden aura"),
    (range(91,100),  "transcendent cosmic armor, reality distorting around them"),
]

def get_equipment(lvl: int) -> str:
    if lvl == 100:
        return "ultimate transcendent power, beyond mortal comprehension, universe-scale aura"
    for r, desc in TIER_EQUIPMENT:
        if lvl in r:
            return desc
    return "adventurer gear"

def build_prompt(gender: str, cls: str, lvl: int) -> str:
    return (
        f"RPG character portrait, {gender} {cls}, level {lvl} {level_name(lvl)}, "
        f"{CLASS_STYLE.get(cls, 'adventurer gear')}, {get_equipment(lvl)}, "
        f"dark fantasy style, Solo Leveling and Ragnarok Online inspired, "
        f"detailed digital illustration, dramatic cinematic lighting, "
        f"dark atmospheric background with subtle fog, square 1:1 format, "
        f"professional game art, upper body portrait, face clearly visible"
    )

# ── Gemini client ─────────────────────────────────────────────────────────────
def make_client():
    if USE_VERTEX:
        if not GCP_PROJECT:
            sys.exit("ERROR: Set GOOGLE_CLOUD_PROJECT for Vertex AI mode.")
        print(f"  Auth: Vertex AI  project={GCP_PROJECT}  location={GCP_LOCATION}")
        return genai.Client(vertexai=True, project=GCP_PROJECT, location=GCP_LOCATION)
    else:
        if not GEMINI_API_KEY:
            sys.exit("ERROR: Set GEMINI_API_KEY for AI Studio mode.")
        print(f"  Auth: Google AI Studio (AI Studio key)")
        return genai.Client(api_key=GEMINI_API_KEY)

def generate_image(client, prompt: str) -> bytes | None:
    try:
        resp = client.models.generate_images(
            model=IMAGEN_MODEL,
            prompt=prompt,
            config=genai_types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
                safety_filter_level="block_only_high",
                person_generation="allow_adult",
            ),
        )
        if resp.generated_images:
            return resp.generated_images[0].image.image_bytes
        return None
    except Exception as e:
        err = str(e)
        if "403" in err and "permission" in err.lower():
            print("\n\n" + "─"*60)
            print("IMAGEN ACCESS DENIED (403)")
            print("─"*60)
            print("Imagen 3 is NOT enabled for your current credentials.")
            print()
            if USE_VERTEX:
                print("Vertex AI fix:")
                print("  1. Enable Vertex AI API: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com")
                print("  2. Ensure billing is enabled on your GCP project")
                print("  3. Run: gcloud auth application-default login")
            else:
                print("AI Studio fix (try one):")
                print("  A. Switch to Vertex AI:  export USE_VERTEX=true")
                print("     Then set GOOGLE_CLOUD_PROJECT and run:")
                print("     gcloud auth application-default login")
                print()
                print("  B. Check if your AI Studio account has Imagen access:")
                print("     https://aistudio.google.com  → API keys → check model list")
                print("─"*60 + "\n")
            sys.exit(1)
        print(f"  API error: {e}")
        return None

# ── Supabase helpers ──────────────────────────────────────────────────────────
def ensure_bucket(sb):
    try:
        sb.storage.create_bucket(BUCKET_NAME, options={"public": True})
        print(f"  Created bucket '{BUCKET_NAME}'.")
    except Exception as e:
        if "already exists" in str(e).lower() or "Duplicate" in str(e):
            print(f"  Bucket '{BUCKET_NAME}' already exists.")
        else:
            print(f"  Bucket note: {e}")

def file_exists(sb, path: str) -> bool:
    try:
        folder = "/".join(path.split("/")[:-1])
        fname  = path.split("/")[-1]
        items  = sb.storage.from_(BUCKET_NAME).list(folder)
        return isinstance(items, list) and any(
            isinstance(i, dict) and i.get("name") == fname for i in items
        )
    except Exception:
        return False

def upload(sb, path: str, data: bytes) -> bool:
    try:
        sb.storage.from_(BUCKET_NAME).upload(
            path=path,
            file=data,
            file_options={
                "content-type": "image/png",
                "cache-control": "public, max-age=31536000",
                "upsert": "false",
            },
        )
        return True
    except Exception as e:
        print(f"  Upload error: {e}")
        return False

# ── CLI args ──────────────────────────────────────────────────────────────────
def parse_args():
    p = argparse.ArgumentParser(description="Generate Quest Log character portraits")
    p.add_argument("--dry-run",  action="store_true", help="Print prompts, don't call APIs")
    p.add_argument("--gender",   choices=GENDERS,  default=None, help="Only generate this gender")
    p.add_argument("--class",    dest="cls", choices=CLASSES, default=None, help="Only generate this class")
    p.add_argument("--level",    type=int,   default=None, help="Only generate this level (1-100)")
    p.add_argument("--level-from", type=int, default=1,   help="Start from this level")
    p.add_argument("--level-to",   type=int, default=100, help="End at this level (inclusive)")
    return p.parse_args()

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    args = parse_args()

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        sys.exit("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY.")

    genders = [args.gender] if args.gender else GENDERS
    classes = [args.cls]    if args.cls    else CLASSES
    if args.level:
        levels = [args.level]
    else:
        levels = range(args.level_from, args.level_to + 1)

    total = len(genders) * len(classes) * len(levels)

    print("=" * 60)
    print("Quest Log — Portrait Generator")
    print(f"  Model:    {IMAGEN_MODEL}")
    print(f"  Bucket:   {BUCKET_NAME}")
    print(f"  Scope:    {len(genders)}g × {len(classes)}c × {len(levels)}l = {total} portraits")
    print(f"  Dry run:  {args.dry_run}")

    if args.dry_run:
        print("\nDRY RUN — showing first 3 prompts:")
        for g in genders[:1]:
            for c in classes[:1]:
                for lvl in list(levels)[:3]:
                    print(f"\n  [{g}/{c}/{lvl}]")
                    print(f"  {build_prompt(g, c, lvl)}")
        print("\nDry run complete.")
        return

    gemini = make_client()
    sb     = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    ensure_bucket(sb)

    print("=" * 60 + "\n")

    done = skipped = failed = 0
    idx  = 0

    for gender in genders:
        for cls in classes:
            for lvl in levels:
                idx  += 1
                path  = f"{gender}/{cls}/{lvl}.png"
                print(f"[{idx:4d}/{total}] {path}", end="  ", flush=True)

                if file_exists(sb, path):
                    print("SKIP")
                    skipped += 1
                    continue

                prompt = build_prompt(gender, cls, lvl)
                img_bytes = None

                for attempt in range(1, MAX_RETRIES + 1):
                    img_bytes = generate_image(gemini, prompt)
                    if img_bytes:
                        break
                    if attempt < MAX_RETRIES:
                        print(f"\n    Retry {attempt}/{MAX_RETRIES} in {RETRY_DELAY_SEC}s...", end="")
                        time.sleep(RETRY_DELAY_SEC)

                if not img_bytes:
                    print("FAIL (generation)")
                    failed += 1
                    time.sleep(RATE_LIMIT_SEC)
                    continue

                if upload(sb, path, img_bytes):
                    print(f"OK  ({len(img_bytes):,} bytes)")
                    done += 1
                else:
                    print("FAIL (upload)")
                    failed += 1

                time.sleep(RATE_LIMIT_SEC)

    print()
    print("=" * 60)
    print(f"Generated: {done}  Skipped: {skipped}  Failed: {failed}")
    print("=" * 60)

    if failed:
        print(f"\nRe-run to retry {failed} failed portraits.")
        sys.exit(1)


if __name__ == "__main__":
    main()
