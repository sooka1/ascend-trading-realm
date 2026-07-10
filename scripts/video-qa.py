#!/usr/bin/env python3
"""
Automated video QA — samples frames and asks a vision model to flag
distortions in faces / hands / logo motion.

Usage:
    python scripts/video-qa.py <video.mp4> [--samples N] [--model ID]

Env:
    LOVABLE_API_KEY (required) — pre-set in the sandbox.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import requests

API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions"
DEFAULT_MODEL = "google/gemini-2.5-flash"

PROMPT = (
    "You are a strict video QA reviewer. Inspect this single frame and report ONLY visible defects.\n"
    "Check for:\n"
    "  1. face_distortion  — asymmetric eyes, warped features, melted skin, extra/missing facial parts\n"
    "  2. hand_distortion  — wrong finger count, fused fingers, extra limbs, unnatural wrist geometry\n"
    "  3. logo_issue       — logo missing, warped, cut off, unreadable, drifting off the wall, or clearly moving unnaturally\n"
    "  4. other            — floating objects, morphing between elements, text glitches\n\n"
    "Return STRICT JSON only, no prose:\n"
    '{"face_distortion": bool, "hand_distortion": bool, "logo_issue": bool, "other": bool, "notes": "<one short sentence, or empty>"}'
)


def ffprobe_duration(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        text=True,
    )
    return float(out.strip())


def sample_frames(video: Path, out_dir: Path, n: int) -> list[Path]:
    duration = ffprobe_duration(video)
    # Evenly spaced timestamps, avoiding the very start/end.
    step = duration / (n + 1)
    frames: list[Path] = []
    for i in range(1, n + 1):
        t = round(step * i, 2)
        out = out_dir / f"frame_{i:02d}_{t}s.jpg"
        subprocess.check_call([
            "ffmpeg", "-loglevel", "error", "-ss", str(t), "-i", str(video),
            "-frames:v", "1", "-q:v", "3", "-vf", "scale=1024:-2", "-y", str(out),
        ])
        frames.append(out)
    return frames


def analyze_frame(frame: Path, model: str, api_key: str) -> dict:
    b64 = base64.b64encode(frame.read_bytes()).decode()
    payload = {
        "model": model,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": PROMPT},
                {"type": "image_url",
                 "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
            ],
        }],
        "response_format": {"type": "json_object"},
    }
    r = requests.post(API_URL, headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }, json=payload, timeout=120)
    if r.status_code != 200:
        return {"error": f"HTTP {r.status_code}: {r.text[:200]}"}
    try:
        content = r.json()["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as e:  # noqa: BLE001
        return {"error": f"parse failure: {e}"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--samples", type=int, default=8)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    args = ap.parse_args()

    api_key = os.environ.get("LOVABLE_API_KEY")
    if not api_key:
        print("ERROR: LOVABLE_API_KEY is not set.", file=sys.stderr)
        return 2
    if not args.video.exists():
        print(f"ERROR: video not found: {args.video}", file=sys.stderr)
        return 2

    tmp = Path(tempfile.mkdtemp(prefix="vqa_"))
    try:
        print(f"Sampling {args.samples} frames from {args.video.name}...")
        frames = sample_frames(args.video, tmp, args.samples)

        results = []
        totals = {"face_distortion": 0, "hand_distortion": 0, "logo_issue": 0, "other": 0}
        for f in frames:
            r = analyze_frame(f, args.model, api_key)
            r["frame"] = f.name
            results.append(r)
            for k in totals:
                if r.get(k):
                    totals[k] += 1
            flag = "".join("!" if r.get(k) else "." for k in totals)
            note = r.get("notes") or r.get("error") or "ok"
            print(f"  [{flag}] {f.name}  {note}")

        print("\n===== SUMMARY =====")
        print(f"Frames analyzed: {len(results)}")
        for k, v in totals.items():
            print(f"  {k:18s}: {v}/{len(results)}")
        verdict = "PASS" if all(v == 0 for v in totals.values()) else "FAIL"
        print(f"\nVerdict: {verdict}")

        report = {
            "video": str(args.video),
            "samples": len(results),
            "totals": totals,
            "verdict": verdict,
            "frames": results,
        }
        out = Path("/mnt/documents") / f"video-qa-{args.video.stem}.json"
        out.write_text(json.dumps(report, indent=2, ensure_ascii=False))
        print(f"\nFull report: {out}")
        return 0 if verdict == "PASS" else 1
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())