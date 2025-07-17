# Stat Block Templates

This document describes the stat block template system for generating consistent monster stat blocks in the folklore project.

## Overview

The template system provides pre-defined stat block structures for different monster types, ensuring consistency and reducing the time needed to create new monsters. Each template includes default values for all required stat block fields and can be customized as needed.

## Available Templates

### 1. Humanoid Template
- **Category**: `humanoid`
- **Description**: Basic template for humanoid creatures like bandits, guards, cultists
- **Default CR**: 1
- **Key Features**: 
  - Standard humanoid abilities
  - Basic weapon attacks
  - Common languages

### 2. Dragon Template
- **Category**: `dragon`
- **Description**: Template for dragon and dragon-like creatures
- **Default CR**: 12
- **Key Features**:
  - High armor class and hit points
  - Legendary actions
  - Breath weapon traits
  - Damage resistances and immunities

### 3. Undead Template
- **Category**: `undead`
- **Description**: Template for undead creatures like skeletons, zombies, ghosts
- **Default CR**: 1
- **Key Features**:
  - Undead fortitude trait
  - Damage immunities (poison)
  - Condition immunities
  - Darkvision

### 4. Beast Template
- **Category**: `beast`
- **Description**: Template for beasts and natural creatures
- **Default CR**: 1
- **Key Features**:
  - Natural armor
  - Keen senses
  - Basic attacks (bite, claw)
  - Limited languages

### 5. Construct Template
- **Category**: `construct`
- **Description**: Template for constructs and magical creations
- **Default CR**: 9
- **Key Features**:
  - High damage resistances
  - Magic resistance
  - Immutable form
  - Condition immunities

### 6. Fiend Template
- **Category**: `fiend`
- **Description**: Template for fiends and evil outsiders
- **Default CR**: 6
- **Key Features**:
  - Devil's sight
  - Magic resistance
  - Damage resistances
  - Telepathy

### 7. Celestial Template
- **Category**: `celestial`
- **Description**: Template for celestials and divine beings
- **Default CR**: 8
- **Key Features**:
  - Angelic weapons
  - Divine awareness
  - Innate spellcasting
  - Damage immunities

## Usage

### Basic Template Usage

```typescript
import { 
  createMonsterFromTemplate, 
  HUMANOID_TEMPLATE 
} from '../templates/statblock-templates';

// Create a basic monster from template
const bandit = createMonsterFromTemplate(
  'Mountain Bandit',
  'Frostpeak Mountains',
  HUMANOID_TEMPLATE
);
```

### Customizing Templates

```typescript
// Create a monster with customizations
const customBandit = createMonsterFromTemplate(
  'Elite Guard',
  'Royal Palace',
  HUMANOID_TEMPLATE,
  {
    armorClass: 16,
    armorType: 'chain mail',
    hitPoints: 32,
    hitDice: '5d8 + 10',
    abilityScores: {
      str: 16,
      dex: 14,
      con: 14,
      int: 10,
      wis: 12,
      cha: 10
    },
    skills: {
      perception: 4,
      athletics: 6
    },
    challengeRating: 3,
    experiencePoints: 700,
    actions: [
      {
        name: 'Longsword',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage.'
      }
    ]
  }
);
```

### Applying Templates to Existing Monsters

```typescript
import { applyTemplate, DRAGON_TEMPLATE } from '../templates/statblock-templates';

// Apply template to existing monster data
const enhancedMonster = applyTemplate(existingMonster, DRAGON_TEMPLATE);
```

### Template Functions

#### `getAllTemplates()`
Returns an array of all available templates.

#### `getTemplateByCategory(category: string)`
Returns a template by its category (e.g., 'dragon', 'humanoid').

#### `getTemplateByName(name: string)`
Returns a template by its name (case-insensitive).

#### `createMonsterFromTemplate(name, region, template, customizations?)`
Creates a new monster from a template with optional customizations.

#### `applyTemplate(monsterData, template)`
Applies a template to existing monster data, merging the template with any existing statblock data.

## Template Structure

Each template follows this structure:

```typescript
interface StatBlockTemplate {
  name: string;
  description: string;
  category: string;
  template: {
    armorClass: number;
    armorType?: string;
    hitPoints: number;
    hitDice?: string;
    speed: {
      walk: number;
      fly?: number;
      swim?: number;
      climb?: number;
      burrow?: number;
    };
    abilityScores: {
      str: number;
      dex: number;
      con: number;
      int: number;
      wis: number;
      cha: number;
    };
    savingThrows?: { [key: string]: number };
    skills?: { [key: string]: number };
    damageResistances?: string;
    damageImmunities?: string;
    conditionImmunities?: string;
    senses: {
      darkvision?: number;
      blindsight?: number;
      tremorsense?: number;
      truesight?: number;
      passivePerception: number;
    };
    languages: string[];
    challengeRating: number;
    experiencePoints: number;
    traits?: Array<{ name: string; description: string }>;
    actions?: Array<{ name: string; description: string }>;
    legendaryActions?: Array<{ name: string; description: string }>;
    lairActions?: Array<{ name: string; description: string }>;
  };
}
```

## Best Practices

### 1. Choose the Right Template
- Select a template that matches the monster's type and power level
- Consider the monster's role in your campaign
- Adjust the challenge rating as needed

### 2. Customize Appropriately
- Override default values that don't fit your monster
- Add unique traits and abilities
- Ensure the monster feels distinct from the template

### 3. Balance Considerations
- Templates provide a good starting point for balance
- Adjust hit points, armor class, and damage based on CR
- Consider the monster's role (combat, social, exploration)

### 4. Lore Integration
- Templates include basic lore generation
- Customize the lore to fit your setting
- Add regional or cultural elements

## Integration with Export System

Templates work seamlessly with the export system:

```typescript
import { generateHomebreweryMarkup } from '../lib/utils/homebrewery-export';

// Create monster from template
const monster = createMonsterFromTemplate('My Monster', 'My Region', TEMPLATE);

// Export to Homebrewery
const markup = generateHomebreweryMarkup(monster, {
  includeLore: true,
  includeCitations: false
});
```

## Testing

Run the template test script to verify functionality:

```bash
npx ts-node src/scripts/test-statblock-templates.ts
```

This will test:
- Template listing and retrieval
- Monster creation from templates
- Template application to existing data
- Markup generation from template monsters
- Export functionality

## Future Enhancements

### Planned Features
1. **CR Scaling**: Automatic adjustment of stats based on challenge rating
2. **Regional Variants**: Templates adapted for different regions
3. **Advanced Customization**: More granular control over template application
4. **Template Validation**: Ensure customizations maintain balance
5. **Template Sharing**: Export/import custom templates

### Template Categories to Add
- **Aberration**: For mind flayers, beholders, etc.
- **Elemental**: For elementals and elemental creatures
- **Fey**: For fey creatures and nature spirits
- **Giant**: For giants and giant-kin
- **Monstrosity**: For unique magical beasts
- **Ooze**: For slimes and oozes
- **Plant**: For plant creatures and animated flora

## Contributing

To add a new template:

1. Define the template structure in `src/templates/statblock-templates.ts`
2. Add appropriate default values
3. Include the template in the `getAllTemplates()` function
4. Add tests in the test script
5. Update this documentation

## Examples

See `src/scripts/test-statblock-templates.ts` for comprehensive examples of template usage, including:
- Basic template application
- Customization examples
- Export integration
- Multiple monster creation
- Template retrieval and listing 