# D&D 5e Stat Block Formatting Rules

## Overview
This document defines the formatting conventions for D&D 5e monster stat blocks to ensure consistency and usability during gameplay.

## Core Formatting Principles

### Visual Hierarchy
- **Section headers** are bold and all caps for quick scanning
- **Ability scores** show both the score and modifier
- **Attack descriptions** use italics for key terms
- **Damage expressions** use parentheses for dice notation
- **Ranges and reach** are specified in feet
- **Saving throw DCs** are calculated and shown

## Section-by-Section Formatting

### Core Attributes (Bold Headers)
```
**ARMOR CLASS** 15 (natural armor)
**HIT POINTS** 45 (6d10 + 12)
**SPEED** 30 ft., fly 60 ft.
```

### Ability Scores (Bold with Modifiers)
```
**STR** 16 (+3)
**DEX** 14 (+2)
**CON** 14 (+2)
**INT** 10 (+0)
**WIS** 12 (+1)
**CHA** 8 (-1)
```

### Saving Throws & Skills (Bold)
```
**SAVING THROWS** Str +5, Con +4
**SKILLS** Perception +3, Stealth +4
```

### Damage Resistances/Immunities (Bold)
```
**DAMAGE RESISTANCES** cold, fire, lightning
**DAMAGE IMMUNITIES** poison
**CONDITION IMMUNITIES** poisoned
```

### Senses (Bold)
```
**SENSES** darkvision 60 ft., passive Perception 13
```

### Languages (Bold)
```
**LANGUAGES** Common, Draconic
```

### Challenge Rating (Bold)
```
**CHALLENGE** 3 (700 XP)
```

## Special Abilities (Bold Names)
```
**Amphibious.** The creature can breathe air and water.

**Pack Tactics.** The creature has advantage on attack rolls against a creature if at least one of the creature's allies is within 5 feet of the creature and the ally isn't incapacitated.
```

## Actions (Bold Names with Italic Descriptions)
```
**Multiattack.** The creature makes two attacks: one with its bite and one with its claws.

**Bite.** *Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 8 (1d8 + 4) piercing damage.

**Claw.** *Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 6 (1d6 + 4) slashing damage.
```

## Legendary Actions (Bold Names)
```
**Detect.** The creature makes a Wisdom (Perception) check.

**Tail Attack.** *Melee Weapon Attack:* +5 to hit, reach 10 ft., one target. *Hit:* 7 (1d8 + 4) bludgeoning damage.
```

## Key Formatting Patterns

### 1. Section Headers
- **Bold and all caps** for quick visual scanning
- Examples: **ARMOR CLASS**, **HIT POINTS**, **SPEED**

### 2. Ability Scores
- Format: **STR** 16 (+3)
- Always show both score and modifier
- Use parentheses for modifiers

### 3. Attack Descriptions
- Use *italics* for "Melee Weapon Attack:" and "Hit:"
- Include to-hit bonus, reach, targets, and damage
- Format: *Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 8 (1d8 + 4) piercing damage.

### 4. Damage Expressions
- Use parentheses for dice notation
- Format: 8 (1d8 + 4)
- Include damage type (piercing, slashing, bludgeoning, etc.)

### 5. Ranges and Reach
- Always specify in feet
- Examples: reach 5 ft., range 60 ft.
- Include area of effect if applicable

### 6. Saving Throw DCs
- Calculate based on ability score and proficiency
- Format: DC 13 Constitution saving throw
- Include the ability being used for the save

### 7. Condition Immunities
- List as adjectives
- Examples: poisoned, frightened, charmed
- Use lowercase for consistency

## Implementation Guidelines

### For PDF Generation
- Use consistent font weights for bold headers
- Ensure proper spacing between sections
- Maintain readability at small sizes
- Consider table formatting for ability scores

### For Database Storage
- Store raw values without formatting
- Apply formatting during display/PDF generation
- Maintain calculation formulas for derived values

### For API Responses
- Include both formatted and raw data
- Provide formatting metadata for client-side rendering
- Support multiple output formats (JSON, PDF, HTML)

## Quality Assurance

### Checklist for Stat Block Formatting
- [ ] All section headers are bold and all caps
- [ ] Ability scores show both score and modifier
- [ ] Attack descriptions use italics for key terms
- [ ] Damage expressions include dice notation
- [ ] Ranges and reach are specified in feet
- [ ] Saving throw DCs are calculated correctly
- [ ] Condition immunities are listed as adjectives
- [ ] Visual hierarchy is clear and consistent
- [ ] Formatting follows established D&D conventions
- [ ] Stat block is optimized for DM quick reference

### Common Mistakes to Avoid
- Inconsistent capitalization in headers
- Missing ability score modifiers
- Incorrect dice notation formatting
- Missing reach/range specifications
- Inconsistent italic usage in attacks
- Poor visual hierarchy
- Deviating from established D&D conventions

## References
- D&D 5e Monster Manual formatting standards
- Official Wizards of the Coast stat block examples
- Community feedback on readability and usability 