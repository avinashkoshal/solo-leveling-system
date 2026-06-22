#!/usr/bin/env python3
"""
THE SYSTEM - Solo Leveling Fitness System Generator
Generates a fully personalized RPG-based fitness transformation plan.
"""

import math
import json
import os
from datetime import datetime, timedelta


def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def print_slow(text):
    print(text)


def system_boot():
    clear_screen()
    print("=" * 60)
    print()
    print("         ██████╗ ██╗   ██╗███████╗████████╗███████╗███╗   ███╗")
    print("        ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║")
    print("        ╚█████╗  ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║")
    print("         ╚═══██╗  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║")
    print("        ██████╔╝   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║")
    print("        ╚═════╝    ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝")
    print()
    print("              [ SOLO LEVELING FITNESS SYSTEM v2.0 ]")
    print()
    print("=" * 60)
    print()
    print('  "You have been chosen as a Player."')
    print()
    print("-" * 60)
    print()


def get_player_info():
    print("  >> PLAYER REGISTRATION")
    print()

    name = input("  Enter your name: ").strip()
    if not name:
        name = "Player"

    while True:
        try:
            age = int(input("  Enter your age: "))
            if 14 <= age <= 70:
                break
            print("  [System] Age must be between 14-70.")
        except ValueError:
            print("  [System] Enter a valid number.")

    while True:
        gender = input("  Enter gender (M/F): ").strip().upper()
        if gender in ('M', 'F'):
            break
        print("  [System] Enter M or F.")

    while True:
        try:
            height_cm = float(input("  Enter height in cm (e.g., 170): "))
            if 140 <= height_cm <= 220:
                break
            print("  [System] Height must be between 140-220 cm.")
        except ValueError:
            print("  [System] Enter a valid number.")

    while True:
        try:
            weight = float(input("  Enter current weight in kg: "))
            if 40 <= weight <= 200:
                break
            print("  [System] Weight must be between 40-200 kg.")
        except ValueError:
            print("  [System] Enter a valid number.")

    print()
    print("  >> FITNESS ASSESSMENT")
    print('  Rate your current level (be honest, the System knows):')
    print()
    print("  1. Sedentary (no exercise, desk job)")
    print("  2. Lightly active (walk sometimes, occasional activity)")
    print("  3. Moderately active (exercise 1-2x per week)")
    print("  4. Active (exercise 3-4x per week)")
    print()

    while True:
        try:
            activity = int(input("  Your activity level (1-4): "))
            if 1 <= activity <= 4:
                break
            print("  [System] Enter 1-4.")
        except ValueError:
            print("  [System] Enter a valid number.")

    print()
    print("  >> EQUIPMENT CHECK")
    print("  What equipment do you have access to?")
    print()
    print("  1. Nothing (pure bodyweight)")
    print("  2. Skipping rope only")
    print("  3. Skipping rope + resistance bands")
    print("  4. Skipping rope + pull-up bar")
    print("  5. Skipping rope + resistance bands + pull-up bar")
    print()

    while True:
        try:
            equipment = int(input("  Your equipment (1-5): "))
            if 1 <= equipment <= 5:
                break
            print("  [System] Enter 1-5.")
        except ValueError:
            print("  [System] Enter a valid number.")

    print()
    print("  >> TARGET CONFIGURATION")
    print()

    ideal_weight = calculate_ideal_weight(height_cm, gender)
    print(f"  [System] Based on your height ({height_cm}cm), recommended target: {ideal_weight}kg")
    print()

    while True:
        try:
            target_input = input(f"  Enter target weight in kg (or press Enter for {ideal_weight}kg): ").strip()
            if target_input == "":
                target_weight = ideal_weight
            else:
                target_weight = float(target_input)
            if target_weight < weight:
                break
            print("  [System] Target must be less than current weight.")
        except ValueError:
            print("  [System] Enter a valid number.")

    while True:
        try:
            months_input = input("  Timeline in months (6-12, or press Enter for auto): ").strip()
            if months_input == "":
                weight_to_lose = weight - target_weight
                months = max(6, min(12, math.ceil(weight_to_lose / 2.5)))
            else:
                months = int(months_input)
            if 3 <= months <= 18:
                break
            print("  [System] Timeline must be 3-18 months.")
        except ValueError:
            print("  [System] Enter a valid number.")

    print()
    print("  >> INITIAL FITNESS TEST")
    print("  Complete these now (or estimate honestly):")
    print()

    while True:
        try:
            max_pushups = int(input("  Max push-ups in one go (wall/knee/full, any form): "))
            if 0 <= max_pushups <= 200:
                break
        except ValueError:
            print("  [System] Enter a valid number.")

    while True:
        try:
            max_squats = int(input("  Max bodyweight squats in one go: "))
            if 0 <= max_squats <= 200:
                break
        except ValueError:
            print("  [System] Enter a valid number.")

    while True:
        try:
            max_plank = int(input("  Max plank hold in seconds: "))
            if 0 <= max_plank <= 600:
                break
        except ValueError:
            print("  [System] Enter a valid number.")

    while True:
        try:
            max_rope = int(input("  Max continuous skipping in seconds (0 if no rope): "))
            if 0 <= max_rope <= 1800:
                break
        except ValueError:
            print("  [System] Enter a valid number.")

    return {
        'name': name,
        'age': age,
        'gender': gender,
        'height_cm': height_cm,
        'weight': weight,
        'target_weight': target_weight,
        'activity_level': activity,
        'equipment': equipment,
        'months': months,
        'max_pushups': max_pushups,
        'max_squats': max_squats,
        'max_plank': max_plank,
        'max_rope': max_rope,
        'start_date': datetime.now().strftime('%Y-%m-%d'),
    }


def calculate_ideal_weight(height_cm, gender):
    if gender == 'M':
        ideal = 50 + 0.91 * (height_cm - 152.4)
    else:
        ideal = 45.5 + 0.91 * (height_cm - 152.4)
    return round(ideal)


def calculate_bmr(weight, height_cm, age, gender):
    if gender == 'M':
        return 10 * weight + 6.25 * height_cm - 5 * age + 5
    else:
        return 10 * weight + 6.25 * height_cm - 5 * age - 161


def calculate_tdee(bmr, activity_level):
    multipliers = {1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725}
    return bmr * multipliers[activity_level]


def determine_starting_rank(max_pushups, max_squats, max_plank, max_rope, activity_level):
    score = 0
    score += min(max_pushups / 10, 5)
    score += min(max_squats / 15, 5)
    score += min(max_plank / 30, 5)
    score += min(max_rope / 30, 5)
    score += (activity_level - 1) * 2

    if score < 5:
        return 'E'
    elif score < 10:
        return 'E+'
    elif score < 16:
        return 'D'
    elif score < 22:
        return 'C'
    else:
        return 'B'


def calculate_starting_stats(player):
    str_base = min(10, max(1, player['max_pushups'] // 5))
    agi_base = min(10, max(1, player['max_rope'] // 15))
    vit_base = min(10, max(1, player['max_plank'] // 10))
    int_base = 1
    wil_base = max(1, player['activity_level'])

    return {
        'STR': str_base,
        'AGI': agi_base,
        'VIT': vit_base,
        'INT': int_base,
        'WIL': wil_base,
    }


def generate_rank_milestones(current_weight, target_weight, months):
    total_loss = current_weight - target_weight
    weeks = months * 4

    ranks = ['E', 'D', 'C', 'B', 'A', 'S']
    weeks_per_rank = weeks / 5  # S-rank is maintenance

    milestones = []
    for i, rank in enumerate(ranks):
        if i < 5:
            rank_target = round(current_weight - (total_loss * (i + 1) / 5), 1)
            week_start = int(i * weeks_per_rank) + 1
            week_end = int((i + 1) * weeks_per_rank)
        else:
            rank_target = target_weight
            week_start = int(5 * weeks_per_rank) + 1
            week_end = weeks + 4

        milestones.append({
            'rank': rank,
            'target_weight': rank_target,
            'week_start': week_start,
            'week_end': week_end,
        })

    return milestones


def scale_exercise(base, rank_index, multiplier=1.5):
    return int(base * (multiplier ** rank_index))


def generate_daily_quests(player, milestones):
    pushup_base = max(5, player['max_pushups'] // 2)
    squat_base = max(10, player['max_squats'] // 2)
    plank_base = max(15, player['max_plank'] // 2)
    rope_base = max(30, player['max_rope'] // 2)
    steps_base = 3000 if player['activity_level'] <= 2 else 5000

    has_rope = player['equipment'] >= 2
    has_bands = player['equipment'] in (3, 5)
    has_bar = player['equipment'] in (4, 5)

    pushup_types = [
        "Wall Push-ups",
        "Knee Push-ups",
        "Knee Push-ups + {alt} Full Push-ups",
        "Full Push-ups",
        "Full Push-ups (mix: wide, diamond, regular)",
        "Advanced Push-ups (archer, decline, explosive)",
    ]

    quests = {}
    for i, m in enumerate(milestones):
        rank = m['rank']
        mult = 1 + (i * 0.5)

        pushups = int(pushup_base * mult)
        squats = int(squat_base * mult)
        plank_sec = int(plank_base * mult)
        rope_sec = int(rope_base * mult) if has_rope else 0
        steps = steps_base + (i * 1500)
        water = round(2.0 + (i * 0.3), 1)

        pushup_type = pushup_types[min(i, len(pushup_types) - 1)]
        if '{alt}' in pushup_type:
            alt_count = max(3, pushups // 4)
            pushup_type = pushup_type.replace('{alt}', str(alt_count))
            pushups = pushups - alt_count

        exercises = []
        exercises.append(f"{pushups} {pushup_type}")
        exercises.append(f"{squats} Bodyweight Squats" if i < 2 else f"{squats} Squats (mix: regular, sumo, pulse)")

        if i >= 1:
            lunges = int(squats * 0.4)
            exercises.append(f"{lunges} Lunges (each leg)")

        if i >= 2:
            exercises.append(f"{int(squats * 0.3)} Glute Bridges")

        if i >= 3:
            burpees = max(5, int(pushups * 0.3))
            exercises.append(f"{burpees} Burpees" + (" (modified: no push-up)" if i == 3 else ""))

        if i >= 3 and has_bar:
            exercises.append(f"{max(3, i * 2)} Pull-up attempts (or negatives)")

        if i >= 2 and has_bands:
            exercises.append(f"{int(pushups * 0.5)} Band Rows")
            exercises.append(f"{int(pushups * 0.4)} Band Shoulder Press")

        if has_rope:
            rope_min = rope_sec // 60
            rope_remainder = rope_sec % 60
            if rope_min > 0:
                rope_str = f"{rope_min} min"
                if rope_remainder > 0:
                    rope_str += f" {rope_remainder}s"
            else:
                rope_str = f"{rope_sec}s"
            exercises.append(f"Skipping Rope: {rope_str}" +
                           (f" (breaks allowed)" if i < 2 else f" ({30 + i*15}s on / 15s rest)"))

        if plank_sec >= 60:
            plank_str = f"{plank_sec // 60} min {plank_sec % 60}s" if plank_sec % 60 > 0 else f"{plank_sec // 60} min"
        else:
            plank_str = f"{plank_sec}s"
        exercises.append(f"Plank: {plank_str}")

        if i >= 2:
            side_plank = max(15, plank_sec // 3)
            exercises.append(f"Side Plank: {side_plank}s each side")

        if i >= 3:
            exercises.append(f"Mountain Climbers: {max(10, i * 5)} each side")

        exercises.append(f"Walk: {steps:,} steps")
        exercises.append(f"Water: {water}L")
        exercises.append(f"Sleep: 7+ hours")

        if i >= 1:
            exercises.append("Track all meals")

        time_est = 20 + (i * 10)

        quests[rank] = {
            'exercises': exercises,
            'time_estimate': time_est,
            'steps': steps,
            'water': water,
        }

    return quests


def generate_weekly_dungeons(player, milestones):
    pushup_base = max(5, player['max_pushups'] // 2)
    squat_base = max(10, player['max_squats'] // 2)
    has_rope = player['equipment'] >= 2

    dungeon_names = [
        ("Goblin Cave", "Survive the goblin horde"),
        ("Demon Castle - Floor 1", "Tabata of the damned"),
        ("Red Gate", "No escape until cleared"),
        ("Demon Castle - Floor 100", "Endurance of a demon"),
        ("Double Dungeon", "Where it all began"),
        ("Monarchs Throne", "Final proving ground"),
    ]

    dungeons = {}
    for i, m in enumerate(milestones):
        rank = m['rank']
        name, desc = dungeon_names[i]
        mult = 1 + (i * 0.4)
        pushups = int(pushup_base * mult)
        squats = int(squat_base * mult)
        duration = 15 + (i * 8)

        if i == 0:
            structure = f"""Circuit: {max(3, 5 - (1 if player['activity_level'] == 1 else 0))} rounds
  - {max(5, pushups // 2)} push-ups (any form)
  - {max(8, squats // 2)} squats
  - {'30s skipping' if has_rope else '30s high knees'}
  - 30s rest between rounds
  Target: Complete in under {duration} minutes"""

        elif i == 1:
            structure = f"""Tabata: 20s work / 10s rest, 8 rounds
  Exercises (rotate): Squats, Push-ups, {'Skipping' if has_rope else 'High Knees'}, Plank hold
  Sets: 3 total with 2 min rest between sets
  Target: Complete all 3 sets"""

        elif i == 2:
            structure = f"""AMRAP in {duration} minutes:
  - {pushups} push-ups
  - {squats} squats
  - {int(squats * 0.5)} lunges
  - {'1 min skip rope' if has_rope else '1 min high knees'}
  - 30s plank
  Goal: Beat your previous round count"""

        elif i == 3:
            structure = f"""{duration}-minute circuit (rest only when needed):
  - {pushups} push-ups
  - {squats} squats
  - {int(squats * 0.4)} lunges
  - {max(5, pushups // 3)} burpees
  - {'2 min skip rope' if has_rope else '2 min jogging in place'}
  - 1 min plank
  Repeat until time is up"""

        elif i == 4:
            structure = f"""{duration}-minute endurance challenge:
  - {'5 min skip rope' if has_rope else '5 min jogging in place'}
  - {pushups} push-ups
  - {squat_base * 3} squats
  - {int(squat_base * 1.5)} lunges
  - {max(10, pushups // 2)} burpees
  - 1.5 min plank
  Repeat 3-4 times, minimal rest"""

        else:
            structure = f"""The Ultimate Test - {duration} minutes:
  Complete as many rounds as possible:
  - {pushups} push-ups (varied grips)
  - {squat_base * 4} squats (varied stances)
  - {int(squat_base * 2)} lunges
  - {max(15, pushups)} burpees
  - {'8 min skip rope (double-unders if possible)' if has_rope else '8 min high intensity cardio'}
  - 2 min plank
  This is your final form."""

        dungeons[rank] = {
            'name': name,
            'description': desc,
            'structure': structure,
            'duration': duration,
        }

    return dungeons


def generate_boss_raids(player, milestones):
    pushup_base = max(5, player['max_pushups'])
    squat_base = max(10, player['max_squats'])
    plank_base = max(15, player['max_plank'])
    rope_base = max(30, player['max_rope'])

    boss_names = [
        "King of the Swamp",
        "Cerberus",
        "Ice Elf Monarch",
        "Baran, Demon Monarch",
        "Frost Monarch",
        "Antares, Monarch of Destruction",
    ]

    bosses = []
    for i, m in enumerate(milestones):
        if i >= len(boss_names):
            break

        mult = 1.5 + (i * 0.8)
        pushup_target = int(pushup_base * mult)
        squat_target = int(squat_base * mult)
        plank_target = int(plank_base * mult)
        rope_target = int(rope_base * mult)

        boss = {
            'name': boss_names[i],
            'rank': m['rank'],
            'month': i + 1,
            'tests': [
                {
                    'name': 'Max Push-ups (no stop)',
                    'minimum': int(pushup_target * 0.6),
                    'good': int(pushup_target * 0.8),
                    'excellent': pushup_target,
                },
                {
                    'name': f'Max Squats ({"no stop" if i < 2 else "2 min" if i < 4 else "3 min"})',
                    'minimum': int(squat_target * 0.6),
                    'good': int(squat_target * 0.8),
                    'excellent': squat_target,
                },
                {
                    'name': 'Plank Hold',
                    'minimum': format_seconds(int(plank_target * 0.6)),
                    'good': format_seconds(int(plank_target * 0.8)),
                    'excellent': format_seconds(plank_target),
                },
            ],
            'weight_target': {
                'minimum': m['target_weight'] + 1.5,
                'good': m['target_weight'] + 0.5,
                'excellent': m['target_weight'],
            }
        }

        if player['equipment'] >= 2 and rope_target > 0:
            boss['tests'].append({
                'name': 'Skip Rope (continuous)',
                'minimum': format_seconds(int(rope_target * 0.6)),
                'good': format_seconds(int(rope_target * 0.8)),
                'excellent': format_seconds(rope_target),
            })

        if i >= 2:
            burpee_target = max(10, int(pushup_target * 0.4))
            boss['tests'].append({
                'name': f'Burpees in {2 if i < 4 else 3} min',
                'minimum': int(burpee_target * 0.6),
                'good': int(burpee_target * 0.8),
                'excellent': burpee_target,
            })

        bosses.append(boss)

    return bosses


def generate_nutrition_plan(player):
    bmr = calculate_bmr(player['weight'], player['height_cm'], player['age'], player['gender'])
    tdee = calculate_tdee(bmr, player['activity_level'])

    deficit_moderate = int(tdee - 500)
    deficit_aggressive = int(tdee - 700)

    protein_per_kg = 1.6 if player['gender'] == 'M' else 1.4
    protein_target_start = int(player['weight'] * protein_per_kg * 0.7)
    protein_target_end = int(player['target_weight'] * protein_per_kg)

    return {
        'bmr': int(bmr),
        'tdee': int(tdee),
        'deficit_moderate': deficit_moderate,
        'deficit_aggressive': deficit_aggressive,
        'protein_start': protein_target_start,
        'protein_end': protein_target_end,
        'phases': [
            {
                'name': 'Awareness',
                'rank': 'E',
                'calories': 'No counting',
                'protein': f'{protein_target_start}g (just add protein to meals)',
                'rules': [
                    'LOG everything you eat (photo or note)',
                    'Cut sugary drinks (water/black coffee/green tea only)',
                    'Reduce fried food to max 2x per week',
                    'Add protein to every meal',
                ]
            },
            {
                'name': 'Structure',
                'rank': 'D',
                'calories': f'~{deficit_moderate + 200} cal/day',
                'protein': f'{protein_target_start + 10}g/day',
                'rules': [
                    'Start rough calorie tracking (HealthifyMe / MyFitnessPal)',
                    'No eating after 9 PM',
                    'Reduce carb portions by 25%',
                    'Meal timing: 3 meals + 1 snack',
                ]
            },
            {
                'name': 'Optimization',
                'rank': 'C',
                'calories': f'{deficit_moderate}-{deficit_moderate + 150} cal/day',
                'protein': f'{protein_target_end - 10}g/day',
                'rules': [
                    'Strict calorie tracking',
                    'Meal prep 2 days ahead',
                    'One cheat MEAL per week (not day)',
                    'Replace one meal with high-protein/low-carb option',
                ]
            },
            {
                'name': 'Mastery',
                'rank': 'B+',
                'calories': f'{deficit_aggressive}-{deficit_moderate} cal/day',
                'protein': f'{protein_target_end}g/day',
                'rules': [
                    'Intuitive eating developing',
                    'One refeed day/week (eat at maintenance)',
                    'Focus on food quality over just calories',
                    'Protein timing around workouts',
                ]
            },
        ]
    }


def generate_badges(player, milestones):
    total_loss = player['weight'] - player['target_weight']

    badges = {
        'milestone': [
            {'name': 'First Blood', 'req': 'Complete first daily quest', 'reward': '+15 XP'},
            {'name': 'Consistent', 'req': '7-day streak', 'reward': '+30 XP bonus'},
            {'name': 'Iron Will', 'req': '14-day streak', 'reward': 'Title: "The Persistent"'},
            {'name': 'Unstoppable', 'req': '30-day streak', 'reward': '+200 XP, Title: "One Who Endures"'},
            {'name': 'Centurion', 'req': '100-day streak', 'reward': 'Title: "The Relentless"'},
            {'name': 'Marathon', 'req': '200-day streak', 'reward': 'Title: "Undying Will"'},
            {'name': 'First Kill', 'req': 'Clear first weekly dungeon', 'reward': '+50 XP'},
            {'name': 'Dungeon Master', 'req': 'Clear 10 weekly dungeons', 'reward': 'Title: "Dungeon Conqueror"'},
            {'name': 'Giant Slayer', 'req': 'Clear first boss raid', 'reward': 'Title: "Beyond Human Limits"'},
            {'name': 'Monarch Slayer', 'req': 'Clear all boss raids', 'reward': 'Title: "Shadow Monarch"'},
        ],
        'weight': [],
        'strength': [
            {'name': 'Push-up Initiate', 'req': '25 consecutive push-ups', 'reward': 'Title: "Rising Strength"'},
            {'name': 'Push-up King', 'req': '50 consecutive push-ups', 'reward': 'Title: "Iron Arms"'},
            {'name': 'Plank Warrior', 'req': '2 min plank hold', 'reward': 'Title: "Immovable"'},
            {'name': 'Plank God', 'req': '4 min plank hold', 'reward': 'Title: "Unmovable Force"'},
        ],
        'rank_titles': [
            {'rank': 'D', 'title': 'The Awakened'},
            {'rank': 'C', 'title': 'Hunter'},
            {'rank': 'B', 'title': 'Elite Hunter'},
            {'rank': 'A', 'title': 'National Level Hunter'},
            {'rank': 'S', 'title': 'Shadow Monarch'},
        ]
    }

    if player['equipment'] >= 2:
        badges['strength'].append(
            {'name': 'Skip Lord', 'req': '10 min continuous skipping', 'reward': 'Title: "Dancing Shadow"'}
        )

    weight_thresholds = [3, 5, 7, 10, total_loss]
    weight_badge_names = ['Bronze Scale', 'Silver Scale', 'Gold Scale', 'Platinum Scale', 'Diamond Scale']
    for i, threshold in enumerate(weight_thresholds):
        if threshold > 0 and i < len(weight_badge_names):
            badges['weight'].append({
                'name': f'The {threshold}kg Club',
                'req': f'Lose {threshold}kg total',
                'reward': f'Badge: {weight_badge_names[i]}' +
                         (', Title: "Reborn"' if threshold == total_loss else ''),
            })

    return badges


def generate_shadow_army(player):
    shadows = [
        {'name': 'Igris', 'role': 'Knight', 'habit': 'Morning hydration (500ml on waking)', 'unlock': 'Day 1'},
        {'name': 'Iron', 'role': 'Tank', 'habit': 'Take stairs always, no elevators', 'unlock': 'Week 2'},
        {'name': 'Tank', 'role': 'Mage', 'habit': 'No phone first 30 min of morning', 'unlock': 'Week 3'},
        {'name': 'Tusk', 'role': 'Beast', 'habit': 'Replace one daily snack with protein', 'unlock': 'Week 4'},
        {'name': 'Beru', 'role': 'Marshal', 'habit': '10 min walk after every meal', 'unlock': 'Week 6'},
        {'name': 'Bellion', 'role': 'Grand Marshal', 'habit': f'Sleep by 11 PM', 'unlock': 'Week 8'},
        {'name': 'Greed', 'role': 'Commander', 'habit': 'Meal prep Sundays', 'unlock': 'Week 10'},
        {'name': 'Kaisel', 'role': 'Dragon', 'habit': '5 min morning mobility/stretching', 'unlock': 'Week 12'},
    ]

    if player['age'] < 35:
        shadows.append(
            {'name': 'Marshal Grade', 'role': 'Shadow', 'habit': 'Cold shower (30s minimum)', 'unlock': 'Week 14'}
        )
    else:
        shadows.append(
            {'name': 'Marshal Grade', 'role': 'Shadow', 'habit': 'End shower with 15s cold water', 'unlock': 'Week 14'}
        )

    shadows.append(
        {'name': 'Architect', 'role': 'System', 'habit': 'Weekly review & plan (15 min Sunday)', 'unlock': 'Week 16'}
    )

    return shadows


def generate_skill_tree(player):
    has_rope = player['equipment'] >= 2
    has_bands = player['equipment'] in (3, 5)
    has_bar = player['equipment'] in (4, 5)

    tree = {
        'E': ['Wall Push-ups', 'Assisted Squats (chair support)', 'Plank (knees allowed)', 'Walking'],
        'D': ['Knee Push-ups', 'Full Squats', 'Lunges', 'Full Plank', 'Glute Bridges'],
        'C': ['Full Push-ups', 'Wide Push-ups', 'Sumo Squats', 'Walking Lunges',
               'Mountain Climbers', 'Side Plank'],
        'B': ['Diamond Push-ups', 'Jump Squats', 'Bulgarian Split Squats',
               'Burpees', 'Superman Hold', 'Pike Push-ups'],
        'A': ['Archer Push-ups', 'Pistol Squat progressions', 'Full Burpees',
               'L-Sit attempts', 'Pseudo Planche Lean'],
        'S': ['One-arm push-up progression', 'Pistol Squats', 'Advanced calisthenics',
               'Design your own programming'],
    }

    if has_rope:
        tree['E'].append('Basic Skipping (single bounce)')
        tree['D'].append('Continuous Skipping')
        tree['C'].append('Skip Rope intervals')
        tree['B'].append('Double-under attempts')
        tree['A'].append('Double-unders')
        tree['S'].append('Triple-under attempts')

    if has_bands:
        tree['D'].append('Band Pull-aparts')
        tree['C'].append('Band Rows')
        tree['B'].append('Band Shoulder Press')
        tree['A'].append('Band-assisted pistol squats')

    if has_bar:
        tree['C'].append('Dead Hangs')
        tree['B'].append('Negative Pull-ups')
        tree['A'].append('Pull-ups')
        tree['S'].append('Muscle-up progressions')

    return tree


def format_seconds(seconds):
    if seconds >= 60:
        mins = seconds // 60
        secs = seconds % 60
        if secs == 0:
            return f"{mins} min"
        return f"{mins} min {secs}s"
    return f"{seconds}s"


def render_system(player, milestones, quests, dungeons, bosses, nutrition, badges, shadows, skills):
    start_date = datetime.strptime(player['start_date'], '%Y-%m-%d')
    starting_rank = determine_starting_rank(
        player['max_pushups'], player['max_squats'],
        player['max_plank'], player['max_rope'],
        player['activity_level']
    )
    stats = calculate_starting_stats(player)
    total_power = sum(stats.values())
    weight_to_lose = player['weight'] - player['target_weight']

    output = []
    o = output.append

    o("# THE SYSTEM")
    o("")
    o(f'> "You have been chosen as a Player."')
    o(f"> **Player:** {player['name']} | **Starting Rank:** {starting_rank}-Rank")
    o(f"> **Objective:** {player['weight']}kg → {player['target_weight']}kg ({weight_to_lose}kg to lose)")
    o(f"> **Timeline:** {player['months']} months | **Start Date:** {player['start_date']}")
    o("")
    o("---")
    o("")

    # PLAYER STATS
    o("## PLAYER STATS")
    o("")
    o("| Stat | Governs | Starting Value |")
    o("|------|---------|---------------|")
    o(f"| **STR** (Strength) | Push-ups, squats, lunges | {stats['STR']} |")
    o(f"| **AGI** (Agility) | Skipping, high knees, quick feet | {stats['AGI']} |")
    o(f"| **VIT** (Vitality) | Planks, holds, endurance | {stats['VIT']} |")
    o(f"| **INT** (Intelligence) | Nutrition, hydration, tracking | {stats['INT']} |")
    o(f"| **WIL** (Willpower) | Consistency, streaks, discipline | {stats['WIL']} |")
    o("")
    o(f"**Total Power:** {total_power} | **Level:** 1")
    o("")
    o("**Stat growth:** +0.5 per daily quest (relevant stat) | +2 per weekly dungeon | +5 per boss raid")
    o("")
    o("---")
    o("")

    # PHYSICAL PROFILE
    o("## PHYSICAL PROFILE")
    o("")
    o(f"| Metric | Value |")
    o(f"|--------|-------|")
    o(f"| Age | {player['age']} |")
    o(f"| Height | {player['height_cm']} cm |")
    o(f"| Starting Weight | {player['weight']} kg |")
    o(f"| Target Weight | {player['target_weight']} kg |")
    o(f"| BMR | {nutrition['bmr']} cal/day |")
    o(f"| TDEE | {nutrition['tdee']} cal/day |")
    o(f"| Deficit Target | {nutrition['deficit_moderate']}-{nutrition['deficit_aggressive']} cal/day |")
    o(f"| Protein Target | {nutrition['protein_start']}-{nutrition['protein_end']}g/day |")
    o("")
    o("---")
    o("")

    # RANK SYSTEM
    o("## RANK SYSTEM")
    o("")
    o("| Rank | Level Range | Weight Target | Weeks | Target Date |")
    o("|------|-------------|---------------|-------|-------------|")
    for m in milestones:
        target_date = (start_date + timedelta(weeks=m['week_end'])).strftime('%Y-%m-%d')
        rank_name = get_rank_name(m['rank'])
        o(f"| **{m['rank']}-Rank** ({rank_name}) | {(milestones.index(m)) * 14 + 1}-{(milestones.index(m) + 1) * 14} | {m['target_weight']}kg | {m['week_start']}-{m['week_end']} | {target_date} |")
    o("")
    o("**Level-up:** Every 100 XP = 1 Level")
    o("")
    o("---")
    o("")

    # XP SYSTEM
    o("## XP SYSTEM")
    o("")
    o("| Activity | XP |")
    o("|----------|-----|")
    o("| Daily Quest (full) | +15 XP |")
    o("| Daily Quest (partial, >50%) | +8 XP |")
    o("| Weekly Dungeon cleared | +50 XP |")
    o("| Boss Raid cleared (minimum) | +100 XP |")
    o("| Boss Raid cleared (excellent) | +200 XP |")
    o("| 7-day streak | +30 XP |")
    o("| 30-day streak | +200 XP |")
    o("| 1 kg lost | +50 XP |")
    o("| New exercise unlocked | +25 XP |")
    o("| Missed day (no valid reason) | -10 XP |")
    o("| Missed dungeon | -30 XP |")
    o("| Failed boss raid | 0 XP (retry next week) |")
    o("")
    o("---")
    o("")

    # DAILY QUESTS
    o("## DAILY QUESTS")
    o("")
    o('> "Daily Quest has arrived."')
    o("")

    for rank, quest in quests.items():
        rank_name = get_rank_name(rank)
        milestone = next((m for m in milestones if m['rank'] == rank), None)
        week_range = f"Weeks {milestone['week_start']}-{milestone['week_end']}" if milestone else ""
        o(f"### {rank}-RANK: {rank_name} ({week_range})")
        o("")
        o("```")
        for ex in quest['exercises']:
            o(f"[ ] {ex}")
        o("```")
        o(f"**Time:** ~{quest['time_estimate']} min | **Rest day:** 1 per week (only walk + water + sleep)")
        o("")

    o("---")
    o("")

    # WEEKLY DUNGEONS
    o("## WEEKLY DUNGEONS (Every Saturday)")
    o("")
    o('> "A dungeon gate has appeared."')
    o("")

    for rank, dungeon in dungeons.items():
        o(f"### {rank}-Rank: {dungeon['name']}")
        o(f"*{dungeon['description']}*")
        o("")
        o(f"```")
        o(dungeon['structure'])
        o(f"```")
        o(f"**Duration:** ~{dungeon['duration']} min")
        o("")

    o("---")
    o("")

    # BOSS RAIDS
    o("## BOSS RAIDS (Monthly Fitness Tests)")
    o("")
    o('> "Warning: A powerful enemy has appeared."')
    o("")
    o("Complete at end of each month. You MUST hit minimum to clear. Retry next week if failed.")
    o("")

    for boss in bosses:
        o(f"### Month {boss['month']}: {boss['name']} ({boss['rank']}-Rank)")
        o("")
        o("| Test | Minimum | Good | Excellent |")
        o("|------|---------|------|-----------|")
        for test in boss['tests']:
            o(f"| {test['name']} | {test['minimum']} | {test['good']} | {test['excellent']} |")
        o(f"| Weight | ≤{boss['weight_target']['minimum']}kg | ≤{boss['weight_target']['good']}kg | ≤{boss['weight_target']['excellent']}kg |")
        o("")

    o("---")
    o("")

    # NUTRITION
    o("## NUTRITION PROTOCOL")
    o("")
    o('> "A new skill has been acquired: [Caloric Awareness]"')
    o("")
    o(f"**Your numbers:** BMR = {nutrition['bmr']} cal | TDEE = {nutrition['tdee']} cal | Deficit target = {nutrition['deficit_moderate']}-{nutrition['deficit_aggressive']} cal")
    o("")

    for phase in nutrition['phases']:
        o(f"### Phase: {phase['name']} ({phase['rank']}-Rank)")
        o(f"- **Calories:** {phase['calories']}")
        o(f"- **Protein:** {phase['protein']}")
        o("- **Rules:**")
        for rule in phase['rules']:
            o(f"  - {rule}")
        o("")

    o("### Sample Day (at deficit):")
    o("```")
    cals = nutrition['deficit_moderate']
    o(f"Breakfast ({int(cals*0.25)} cal): Eggs/oats + protein source")
    o(f"Lunch ({int(cals*0.30)} cal): Balanced plate (protein + carb + veggie)")
    o(f"Snack ({int(cals*0.12)} cal): Fruits + nuts OR protein shake")
    o(f"Dinner ({int(cals*0.28)} cal): Protein + vegetables + moderate carb")
    o(f"Buffer ({int(cals*0.05)} cal): Tea + small snack if needed")
    o(f"Total: ~{cals} cal | Protein: ~{nutrition['protein_end']}g")
    o("```")
    o("")
    o("---")
    o("")

    # PENALTY SYSTEM
    o("## PENALTY SYSTEM")
    o("")
    o('> "Warning: Failure to complete daily quest will result in penalties."')
    o("")
    o("| Offense | Penalty |")
    o("|---------|---------|")
    o("| Miss 1 day (no valid reason) | -10 XP, do 1.5x next day |")
    o("| Miss 2 consecutive days | -25 XP, streak resets |")
    o("| Miss 3+ days | -50 XP, drop 1 level, 'Weakened' debuff (2 days at lower rank) |")
    o("| Unplanned binge eating | -15 XP from INT stat |")
    o("| Skip weekly dungeon | -30 XP, no streak bonus that week |")
    o("| Fail boss raid | No rank-up. Retry next week. |")
    o("")
    o("### Valid Rest (No Penalty):")
    o("- Illness or injury")
    o("- Scheduled rest day (1/week)")
    o("- Travel day (walk quest still applies)")
    o('- "Emergency Quest" swap: replace workout with 10,000 steps')
    o("")
    o("---")
    o("")

    # BADGES
    o("## BADGES & TITLES")
    o("")
    o('> "A title has been granted."')
    o("")
    o("### Streak Badges")
    o("")
    o("| Badge | Requirement | Reward |")
    o("|-------|-------------|--------|")
    for b in badges['milestone']:
        o(f"| **{b['name']}** | {b['req']} | {b['reward']} |")
    o("")

    o("### Weight Loss Badges")
    o("")
    o("| Badge | Requirement | Reward |")
    o("|-------|-------------|--------|")
    for b in badges['weight']:
        o(f"| **{b['name']}** | {b['req']} | {b['reward']} |")
    o("")

    o("### Strength Badges")
    o("")
    o("| Badge | Requirement | Reward |")
    o("|-------|-------------|--------|")
    for b in badges['strength']:
        o(f"| **{b['name']}** | {b['req']} | {b['reward']} |")
    o("")

    o("### Rank-Up Titles")
    o("")
    o("| Rank Achieved | Title |")
    o("|---------------|-------|")
    for b in badges['rank_titles']:
        o(f"| {b['rank']}-Rank | \"{b['title']}\" |")
    o("")
    o("---")
    o("")

    # SHADOW ARMY
    o("## SHADOW ARMY (Habit Stacking)")
    o("")
    o('> "Arise."')
    o("")
    o("As you level up, you summon shadows — automatic habits. Once summoned, they are PERMANENT.")
    o("")
    o("| Shadow | Role | Habit | Unlocks |")
    o("|--------|------|-------|---------|")
    for s in shadows:
        o(f"| **{s['name']}** | {s['role']} | {s['habit']} | {s['unlock']} |")
    o("")
    o("---")
    o("")

    # SKILL TREE
    o("## SKILL TREE")
    o("")
    o('> "New skill available."')
    o("")
    o("Only use exercises unlocked at your current rank. Attempting higher-rank skills = injury risk.")
    o("")
    for rank, skill_list in skills.items():
        rank_name = get_rank_name(rank)
        o(f"### {rank}-Rank: {rank_name}")
        for skill in skill_list:
            o(f"- {skill}")
        o("")
    o("---")
    o("")

    # EMERGENCY PROTOCOLS
    o("## EMERGENCY PROTOCOLS")
    o("")
    o('### "I\'m too tired today"')
    o("→ **Minimum Viable Quest:** 10 squats + 10 push-ups (any form) + 30s plank + walk")
    o("→ Earns 5 XP (reduced, no penalty)")
    o("")
    o('### "I\'m sick/injured"')
    o("→ **Rest Mode:** Only hydration + sleep active")
    o("→ No XP loss, no streak loss up to 3 days. Beyond 3: streak pauses (not resets)")
    o("")
    o('### "I fell off for a week+"')
    o("→ **Re-Awakening:** Drop one rank's quest for 3 days, then return")
    o("→ Streak resets, but levels/stats stay. You keep what you earned.")
    o("")
    o('### "Weight plateau (2+ weeks)"')
    o("→ Increase daily steps by 2,000 for 2 weeks")
    o("→ Add one extra cardio session (5 min skip/walk)")
    o("→ Re-track calories strictly for 1 week")
    o("→ If still stuck: diet break at maintenance for 1 week, then resume")
    o("")
    o("---")
    o("")

    # RULES
    o("## RULES OF THE SYSTEM")
    o("")
    o("1. **The System does not negotiate.** Daily quests are non-negotiable (except valid rest).")
    o("2. **Progress over perfection.** 50% done > 0% done. Partial credit exists.")
    o("3. **Cannot skip ranks.** Even if weight drops fast, fitness tests must pass.")
    o("4. **Weigh weekly only.** Sunday morning, empty stomach. Daily fluctuations are noise.")
    o("5. **The System adapts.** Too easy for 2 weeks? Promote early. Too hard? Stay longer.")
    o("6. **Respect the skill tree.** No exercises above your rank. Ego = injury.")
    o("7. **Rest is a quest.** Sleep and recovery are part of the system.")
    o("8. **Track honestly.** The system only works with truth.")
    o("")
    o("---")
    o("")

    # TRACKING
    o("## DAILY TRACKING TEMPLATE")
    o("")
    o("```")
    o(f"Date: _________ | Level: ___ | Rank: ___ | Streak: ___ days")
    o("")
    o("DAILY QUEST:")
    o("[ ] Exercise 1: ___")
    o("[ ] Exercise 2: ___")
    o("[ ] Exercise 3: ___")
    o("[ ] ... (see rank-specific quest)")
    o("[ ] Steps: ___/target")
    o("[ ] Water: ___L")
    o("[ ] Sleep: ___ hours")
    o("[ ] Nutrition: tracked / on target / off")
    o("")
    o("XP Earned: ___ | Running Total: ___")
    o("Stats: STR +___ | AGI +___ | VIT +___ | INT +___ | WIL +___")
    o("Notes: ___")
    o("```")
    o("")
    o("## WEEKLY TRACKING TEMPLATE")
    o("")
    o("```")
    o("Week: ___ | Weight: ___kg | Streak: ___ days | Level: ___")
    o("")
    o("Quests Completed: ___/7")
    o("Dungeon Cleared: [ ] Yes [ ] No")
    o("Total XP This Week: ___ | Running Total: ___")
    o("")
    o("Measurements:")
    o("  Weight: ___ kg")
    o("  Waist: ___ inches")
    o("")
    o("Reflection:")
    o("  What went well: ___")
    o("  What was hard: ___")
    o("  Next week focus: ___")
    o("```")
    o("")
    o("---")
    o("")

    # GETTING STARTED
    o("## GETTING STARTED — DAY 1")
    o("")
    o("1. Record your starting stats (already done during registration)")
    o("2. Take a 'Day 1' photo (front + side) — your E-Rank Hunter photo")
    o("3. Complete your first E-Rank Daily Quest")
    o("4. Earn badge: **First Blood**")
    o("5. Summon your first shadow: **Igris** (drink 500ml water on waking)")
    o("6. Begin.")
    o("")
    o("---")
    o("")
    o('> *"I alone level up."*')
    o(f">")
    o(f"> — Player: {player['name']}")
    o(f"> — System Initiated: {player['start_date']}")
    o(f"> — Target: Shadow Monarch ({player['target_weight']}kg)")
    o(f"> — Status: ACTIVE")

    return '\n'.join(output)


def get_rank_name(rank):
    names = {
        'E': 'Weakest Hunter',
        'D': 'Awakened',
        'C': 'Proven Hunter',
        'B': 'Elite',
        'A': 'National Level',
        'S': 'Shadow Monarch',
    }
    return names.get(rank, 'Unknown')


def main():
    system_boot()
    player = get_player_info()

    print()
    print("  " + "=" * 50)
    print('  >> SYSTEM INITIALIZING...')
    print(f'  >> Player "{player["name"]}" registered.')
    print(f'  >> Analyzing physical profile...')
    print(f'  >> Calculating optimal progression path...')
    print(f'  >> Generating personalized quest system...')
    print()

    milestones = generate_rank_milestones(player['weight'], player['target_weight'], player['months'])
    quests = generate_daily_quests(player, milestones)
    dungeons = generate_weekly_dungeons(player, milestones)
    bosses = generate_boss_raids(player, milestones)
    nutrition = generate_nutrition_plan(player)
    badges = generate_badges(player, milestones)
    shadows = generate_shadow_army(player)
    skills = generate_skill_tree(player)

    system_md = render_system(player, milestones, quests, dungeons, bosses, nutrition, badges, shadows, skills)

    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(output_dir, f"SYSTEM_{player['name'].upper().replace(' ', '_')}.md")
    with open(output_file, 'w') as f:
        f.write(system_md)

    player_file = os.path.join(output_dir, f"player_{player['name'].lower().replace(' ', '_')}.json")
    with open(player_file, 'w') as f:
        json.dump(player, f, indent=2)

    print(f'  >> SYSTEM GENERATED SUCCESSFULLY.')
    print(f'  >> Output: {output_file}')
    print(f'  >> Player data: {player_file}')
    print()
    print("  " + "=" * 50)
    print()
    print(f'  "Player {player["name"]} — the System has acknowledged you."')
    print(f'  "Your journey from {player["weight"]}kg to {player["target_weight"]}kg begins now."')
    print(f'  "Daily Quest will arrive tomorrow at dawn."')
    print()
    print('  >> STATUS: ACTIVE')
    print()


if __name__ == '__main__':
    main()
