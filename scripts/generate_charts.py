#!/usr/bin/env python3
"""
Karate Biometric Visual Analytics & Chart Generation Engine
باشگاه کاراته شرکت برق منطقه ای خراسان

Headless, server-ready script producing high-resolution biometric dashboards
for karate athletes using Xiaomi S400 telemetry data.
"""

import os
import sys
import json
import math
import numpy as np

import matplotlib
matplotlib.use("Agg")  # Server-ready headless rendering without X11
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import arabic_reshaper
from bidi.algorithm import get_display

# Resolve paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_FILE = os.path.join(SCRIPT_DIR, "athlete-import-data.json")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "generated-reports", "charts")
FONT_BOLD_PATH = os.path.join(PROJECT_ROOT, "public", "fonts", "Vazirmatn-Bold.ttf")
FONT_REG_PATH = os.path.join(PROJECT_ROOT, "public", "fonts", "Vazirmatn-Regular.ttf")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Configure Persian font properties
font_bold = fm.FontProperties(fname=FONT_BOLD_PATH) if os.path.exists(FONT_BOLD_PATH) else None
font_reg = fm.FontProperties(fname=FONT_REG_PATH) if os.path.exists(FONT_REG_PATH) else None

def fa(text: str) -> str:
    """Reshapes and reverses Persian text for proper RTL display in Matplotlib."""
    if not text:
        return ""
    try:
        reshaped = arabic_reshaper.reshape(str(text))
        return get_display(reshaped)
    except Exception:
        return str(text)

# Persian athlete profiles and calendar ages
PROFILES = {
    "Reza": {"nameFa": "رضا", "age": 63, "birthYear": 1342},
    "Maleki": {"nameFa": "ملکی", "age": 55, "birthYear": 1350},
    "Adrian": {"nameFa": "آدریان", "age": 10, "birthYear": 1395},
    "Arsam": {"nameFa": "آرسام", "age": 10, "birthYear": 1395},
    "Amirali": {"nameFa": "امیرعلی", "age": 15, "birthYear": 1390},
    "Yousef": {"nameFa": "یوسف", "age": 14, "birthYear": 1391},
    "Mahyar": {"nameFa": "مهیار", "age": 15, "birthYear": 1390},
    "Homayon": {"nameFa": "همایون", "age": 10, "birthYear": 1395},
    "Amin": {"nameFa": "امین", "age": 15, "birthYear": 1390},
    "Alireza": {"nameFa": "علیرضا", "age": 16, "birthYear": 1389},
    "Ghafari": {"nameFa": "غفاری", "age": 40, "birthYear": 1365},
}

def generate_athlete_dashboard(record: dict):
    name = record["name"]
    profile = PROFILES.get(name, {"nameFa": name, "age": record.get("bodyAge") or 20, "birthYear": 1380})
    display_title = f"{profile['nameFa']} ({name})"

    # Extraction with fallbacks
    weight = record.get("weight") or 60.0
    muscle_pct = record.get("musclePercentage") or 75.0
    muscle_mass = record.get("muscleMass") or (weight * muscle_pct / 100)
    fat_pct = record.get("bodyFatPercentage") or 15.0
    fat_mass = record.get("fatMass") or (weight * fat_pct / 100)
    water_pct = record.get("bodyWaterPercentage") or 60.0
    water_mass = record.get("bodyWaterMass") or (weight * water_pct / 100)
    protein_mass = record.get("proteinMass") or 10.0
    bone_mineral = record.get("boneMineralContent") or 2.5
    skeletal_muscle = record.get("skeletalMuscleMass") or (muscle_mass * 0.5)
    visceral = record.get("visceralFatRating") or 5
    body_age = record.get("bodyAge") or profile["age"]
    bmr = record.get("basalMetabolicRate") or 1500

    # 1. Calculate Karate Analytics Indexes (0 - 100 scale)
    # Kumite Power: high muscle %, low fat %, high skeletal muscle ratio
    kumite_power = min(100, max(20, (muscle_pct * 0.7) + (25 - fat_pct) * 1.5))
    # Kata Stability: low visceral fat, solid bone structure, balanced mass
    kata_stability = min(100, max(20, (muscle_pct * 0.6) + (15 - min(visceral, 15)) * 2.5 + (bone_mineral / 4.0) * 20))
    # Hydration Index
    hydration_idx = min(100, (water_pct / 70.0) * 100)
    # Bone density index
    bone_idx = min(100, (bone_mineral / 3.8) * 100)
    # Metabolic Efficiency index
    metabolic_idx = min(100, (bmr / 1900.0) * 100)

    # Setup Theme & Palette
    bg_color = "#0f172a"        # Deep Slate Navy
    card_bg = "#1e293b"         # Medium Slate
    text_light = "#f8fafc"
    text_muted = "#94a3b8"
    accent_emerald = "#10b981"  # Karate Green
    accent_gold = "#f59e0b"     # Championship Gold
    accent_cyan = "#06b6d4"     # Fluid Cyan
    accent_rose = "#f43f5e"     # Fat warning Rose

    fig = plt.figure(figsize=(15, 6.5), facecolor=bg_color)
    gs = fig.add_gridspec(1, 3, width_ratios=[1.1, 1.1, 0.8], wspace=0.28)

    # -------------------------------------------------------------
    # Panel 1: Radar Chart (6 Karate Biometric Pillars)
    # -------------------------------------------------------------
    ax1 = fig.add_subplot(gs[0, 0], polar=True, facecolor=card_bg)
    ax1.set_theta_offset(math.pi / 2)
    ax1.set_theta_direction(-1)

    categories = [
        "درصد عضلانی",
        "توان کومیته",
        "پایداری کاتا",
        "سطح آب بدن",
        "استحکام اسکلت",
        "راندمان متابولیک"
    ]
    categories_fa = [fa(c) for c in categories]
    
    values = [
        min(100, muscle_pct),
        kumite_power,
        kata_stability,
        hydration_idx,
        bone_idx,
        metabolic_idx
    ]
    # Close polygon
    values += values[:1]
    angles = [n / float(len(categories)) * 2 * math.pi for n in range(len(categories))]
    angles += angles[:1]

    # Target Benchmark (Elite Karate Champion)
    target_vals = [85, 90, 85, 90, 85, 85]
    target_vals += target_vals[:1]

    # Draw grid & labels
    ax1.set_xticks(angles[:-1])
    ax1.set_xticklabels(categories_fa, fontproperties=font_bold, fontsize=9.5, color=text_light)
    ax1.set_ylim(0, 100)
    ax1.set_yticks([25, 50, 75, 100])
    ax1.set_yticklabels(["۲۵", "۵۰", "۷۵", "۱۰۰"], fontproperties=font_reg, fontsize=7.5, color=text_muted)
    ax1.grid(color="#334155", linestyle="--", linewidth=0.7)

    # Plot Target line
    ax1.plot(angles, target_vals, linewidth=1.5, linestyle="--", color=accent_gold, label=fa("هدف قهرمانی WKF"))
    ax1.fill(angles, target_vals, color=accent_gold, alpha=0.08)

    # Plot Athlete polygon
    ax1.plot(angles, values, linewidth=2.5, color=accent_emerald, label=fa("شاخص ورزشکار"))
    ax1.fill(angles, values, color=accent_emerald, alpha=0.35)

    ax1.set_title(fa("رادار تعادل ۶ فاکتور فیزیولوژیک کاراته"), fontproperties=font_bold, fontsize=11.5, color=text_light, pad=18)
    leg = ax1.legend(loc="lower center", bbox_to_anchor=(0.5, -0.18), prop=font_reg, frameon=False, ncol=2)
    for text in leg.get_texts():
        text.set_color(text_light)
        text.set_fontsize(8.5)

    # -------------------------------------------------------------
    # Panel 2: Horizontal Bar Chart of Masses (kg)
    # -------------------------------------------------------------
    ax2 = fig.add_subplot(gs[0, 1], facecolor=card_bg)
    ax2.set_axisbelow(True)
    ax2.grid(axis="x", color="#334155", linestyle=":", linewidth=0.7)

    mass_labels = [
        "توده عضلانی کل",
        "توده عضلات اسکلتی",
        "حجم آب بدن",
        "توده پروتئین",
        "توده چربی بدن",
        "محتوای معدنی استخوان"
    ]
    mass_values = [muscle_mass, skeletal_muscle, water_mass, protein_mass, fat_mass, bone_mineral]
    bar_colors = [accent_emerald, "#34d399", accent_cyan, "#818cf8", accent_rose, "#cbd5e1"]

    y_pos = np.arange(len(mass_labels))
    bars = ax2.barh(y_pos, mass_values, align="center", color=bar_colors, height=0.55, edgecolor="#475569", linewidth=0.8)

    ax2.set_yticks(y_pos)
    ax2.set_yticklabels([fa(lbl) for lbl in mass_labels], fontproperties=font_bold, fontsize=9.5, color=text_light)
    ax2.invert_yaxis()  # Labels read top-to-bottom

    # Annotate bar values
    for bar in bars:
        width = bar.get_width()
        ax2.text(
            width + max(1.0, width * 0.03),
            bar.get_y() + bar.get_height() / 2,
            f"{width:.1f} kg",
            va="center",
            ha="left",
            fontproperties=font_bold,
            fontsize=9,
            color=text_light
        )

    ax2.set_xlim(0, max(mass_values) * 1.25)
    ax2.set_xlabel(fa("کیلوگرم (kg)"), fontproperties=font_reg, fontsize=9, color=text_muted)
    ax2.set_title(fa("تفکیک کمی بافت‌های بدنی و جرم زیستی"), fontproperties=font_bold, fontsize=11.5, color=text_light, pad=12)

    for spine in ax2.spines.values():
        spine.set_color("#334155")
    ax2.tick_params(axis="x", colors=text_muted, labelsize=8)

    # -------------------------------------------------------------
    # Panel 3: Athletic KPIs & Match Division Calibration
    # -------------------------------------------------------------
    ax3 = fig.add_subplot(gs[0, 2], facecolor=card_bg)
    ax3.set_xticks([])
    ax3.set_yticks([])
    for spine in ax3.spines.values():
        spine.set_color("#334155")

    # Header in panel 3
    ax3.text(0.5, 0.92, fa("آمادگی مسابقاتی و رده‌بندی"), ha="center", fontproperties=font_bold, fontsize=11.5, color=text_light)
    ax3.plot([0.1, 0.9], [0.86, 0.86], color=accent_emerald, linewidth=1.5)

    kpis = [
        ("شاخص شتاب کومیته", f"{kumite_power:.0f} / ۱۰۰", accent_emerald if kumite_power > 75 else accent_gold),
        ("پایداری استاتیک کاتا", f"{kata_stability:.0f} / ۱۰۰", accent_emerald if kata_stability > 75 else accent_gold),
        ("سن بیولوژیک vs تقویمی", f"{body_age} در برابر {profile['age']}", accent_cyan if body_age <= profile['age'] else accent_rose),
        ("چربی احشایی (سطح)", f"سطح {visceral}", accent_emerald if visceral < 9 else accent_rose),
        ("متابولیسم پایه (BMR)", f"{bmr} kcal", "#a78bfa"),
        ("شاخص توده بدنی (BMI)", f"{record.get('bmi', 0):.1f} kg/m²", text_light),
    ]

    curr_y = 0.77
    for label, val_str, val_color in kpis:
        ax3.text(0.92, curr_y, fa(label), ha="right", va="center", fontproperties=font_reg, fontsize=8.8, color=text_muted)
        ax3.text(0.08, curr_y, fa(val_str), ha="left", va="center", fontproperties=font_bold, fontsize=9.5, color=val_color)
        ax3.plot([0.08, 0.92], [curr_y - 0.05, curr_y - 0.05], color="#334155", linewidth=0.5, linestyle=":")
        curr_y -= 0.125

    # Master watermark / footer banner
    fig.suptitle(
        fa(f"باشگاه کاراته شرکت برق منطقه ای خراسان • تحلیل بیومتریک: {display_title}"),
        fontproperties=font_bold,
        fontsize=14,
        color=accent_emerald,
        y=0.98
    )

    output_path = os.path.join(OUTPUT_DIR, f"chart_{name}.png")
    plt.savefig(output_path, dpi=130, facecolor=bg_color, edgecolor="none", bbox_inches="tight")
    plt.close(fig)
    print(f"[Chart Generated] {os.path.relpath(output_path, PROJECT_ROOT)}")

def main():
    if not os.path.exists(DATA_FILE):
        print(f"Error: Data file {DATA_FILE} not found.", file=sys.stderr)
        sys.exit(1)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        records = json.load(f)

    print(f"Generating charts for {len(records)} athletes...")
    for record in records:
        generate_athlete_dashboard(record)

    print(f"\nAll {len(records)} athlete charts successfully rendered in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
