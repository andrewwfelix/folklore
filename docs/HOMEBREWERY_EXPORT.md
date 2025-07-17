# Homebrewery Export Feature

This feature allows you to export your folklore monsters to [The Homebrewery V3](https://homebrewery.naturalcrit.com/) format, which creates beautiful D&D 5e style documents that look like official content. The export is optimized for Homebrewery V3's enhanced features and syntax.

## What is The Homebrewery?

The Homebrewery V3 is a web-based tool that uses enhanced markdown formatting with curly bracket syntax (`{{ }}`) to create documents that look like official D&D 5e books. It's perfect for creating:

- Monster manuals
- Adventure modules
- Player handouts
- Campaign supplements

**V3 Features:**
- Enhanced spacing control with `:` characters
- Curly bracket syntax for custom formatting
- Improved table support with column/row spanning
- Style Editor Panel for CSS instead of inline `<style>` tags
- Better page breaks with `\page` and `\column`

## Features

### Export Formats

1. **Homebrewery Format** - Creates markdown files ready for The Homebrewery
2. **Markdown Format** - Standard markdown for other editors
3. **JSON Format** - Raw data for analysis or import into other tools

### Export Options

- **Single Monster** - Export one specific monster
- **All Monsters** - Export your entire collection
- **By Region** - Export monsters from a specific region
- **By Tags** - Export monsters with specific tags (coming soon)

### Customization

- Include/exclude lore sections
- Include/exclude citations
- Include/exclude art descriptions
- Custom styling (background colors, text colors, accent colors)
- V3-optimized spacing and formatting
- Enhanced stat block formatting

## Quick Start

### 1. Test the Export Feature

```bash
# Test the Homebrewery export functionality
ts-node -r tsconfig-paths/register --project tsconfig.json src/scripts/test-homebrewery-export.ts
```

This will generate several test files:
- `test-output-homebrewery-basic.md` - Basic monster export
- `test-output-homebrewery-full.md` - Full monster with all sections
- `test-output-homebrewery-statblock.md` - Stat block only
- `test-output-homebrewery-collection.md` - Collection of multiple monsters
- `test-output-homebrewery-styled.md` - Monster with custom styling
- `test-output-homebrewery-v3.md` - V3-optimized stat block

### 2. Export from Your Database

```bash
# Export all monsters to Homebrewery format
ts-node -r tsconfig-paths/register --project tsconfig.json src/scripts/test-monster-export.ts
```

### 3. Use in The Homebrewery

1. Copy the content from any generated `.md` file
2. Go to [https://homebrewery.naturalcrit.com/](https://homebrewery.naturalcrit.com/)
3. Paste the content into the editor
4. Click "Save" to create your homebrew document
5. Use "Print/Generate PDF" to create a PDF version

## API Usage

### Basic Export

```typescript
import { exportAllMonsters } from '../lib/utils/monster-export';

const result = await exportAllMonsters({
  format: 'homebrewery',
  includeLore: true,
  includeCitations: false,
  includeArtPrompt: false
});

if (result.success) {
  console.log(`Exported ${result.monsterCount} monsters to ${result.filePath}`);
}
```

### Export Single Monster

```typescript
import { exportMonster } from '../lib/utils/monster-export';

const result = await exportMonster('monster-id-here', {
  format: 'homebrewery',
  includeLore: true,
  includeCitations: true,
  includeArtPrompt: false
});
```

### Export by Region

```typescript
import { exportMonstersByRegion } from '../lib/utils/monster-export';

const result = await exportMonstersByRegion('Test Mountains', {
  format: 'homebrewery',
  includeLore: true,
  includeCitations: false,
  includeArtPrompt: false
});
```

### Custom Styling

```typescript
const result = await exportAllMonsters({
  format: 'homebrewery',
  includeLore: true,
  includeCitations: false,
  includeArtPrompt: false,
  customStyling: {
    backgroundColor: '#f5f5dc', // Beige background
    textColor: '#2c1810',       // Dark brown text
    accentColor: '#8b4513'      // Saddle brown accents
  }
});
```

### V3-Style Stat Block

```typescript
import { generateHomebreweryV3StatBlock } from '../lib/utils/homebrewery-export';

const v3Markup = generateHomebreweryV3StatBlock(monsterJson);
```

## Generated Format

The Homebrewery export creates markdown files with this structure:

```markdown
# Monster Name

## Lore

[Lore content here]

## Stat Block

**ARMOR CLASS** 18 (natural armor)
**HIT POINTS** 120 (16d10 + 32)
**SPEED** walk 40 ft., fly 80 ft.
**STR** 20 (+5)  **DEX** 14 (+2)  **CON** 18 (+4)  **INT** 16 (+3)  **WIS** 15 (+2)  **CHA** 18 (+4)
**SAVING THROWS** Str +8, Con +7, Wis +6
**SKILLS** Perception +8, Stealth +6
**DAMAGE RESISTANC** fire, lightning
**DAMAGE IMMUNITIES** cold
**CONDITION IMMUNITIES** frightened
**SENSES** darkvision 120 ft., blindsight 60 ft., passive Perception 18
**LANGUAGES** Common, Draconic, Infernal
**CHALLENGE** 12 (8400 XP)

***Legendary Resistance.*** If the dragon fails a saving throw, it can choose to succeed instead.

***Fire Breath.*** The dragon can exhale fire in a 60-foot cone. Each creature in that area must make a DC 18 Dexterity saving throw.

***ACTIONS***
***Multiattack.*** The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.

***Bite.*** *Melee Weapon Attack:* +8 to hit, reach 10 ft., one target. *Hit:* 16 (2d10 + 5) piercing damage plus 7 (2d6) fire damage.

***Claw.*** *Melee Weapon Attack:* +8 to hit, reach 5 ft., one target. *Hit:* 12 (2d6 + 5) slashing damage.

***LEGENDARY ACTIONS***
***Detect.*** The dragon makes a Wisdom (Perception) check.

***Tail Attack.*** Melee Weapon Attack: +8 to hit, reach 15 ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage.
```

## Custom Styling

In Homebrewery V3, custom CSS styling should be added to the **Style Editor Panel** (located on the right side of the Snippet bar) instead of inline `<style>` tags:

```css
.phb { background-color: #f5f5dc; }
.phb { color: #2c1810; }
.phb h1, .phb h2, .phb h3 { color: #8b4513; }
```

The export utility will include comments with suggested CSS for the Style Editor Panel.

## File Structure

```
src/lib/utils/
├── homebrewery-export.ts    # Homebrewery formatting utilities
├── monster-export.ts        # Database export utilities
└── monster-markup.ts        # Original markdown formatting

src/scripts/
├── test-homebrewery-export.ts    # Test the Homebrewery export
└── test-monster-export.ts        # Test database exports
```

## Tips for Best Results

1. **Use The Homebrewery V3's Preview** - Always preview your document before finalizing
2. **Use the Style Editor Panel** - Add custom CSS to the Style Editor Panel instead of inline styles
3. **Test Different Styles** - Experiment with custom styling to match your theme
4. **Organize by Region** - Export monsters by region for themed collections
5. **Include Citations** - Add citations for academic or research purposes
6. **Custom Art Descriptions** - Include art prompts for visual reference
7. **Use V3 Spacing** - The export uses `:` for better spacing control
8. **Page Breaks** - Use `\page` for page breaks between monsters

## Troubleshooting

### Common Issues

1. **Empty Export Files** - Check that your database has monsters with `status: 'complete'`
2. **Formatting Issues** - Ensure your monster data has all required stat block fields
3. **Styling Not Applied** - Make sure custom styling uses valid CSS color codes

### Getting Help

- Check the generated test files for examples
- Review the monster data structure in `src/types/index.ts`
- Test with the sample data in `src/scripts/test-homebrewery-export.ts`

## Future Enhancements

- [ ] Tag-based filtering
- [ ] Custom templates for different monster types
- [ ] Integration with other VTT formats
- [ ] Batch processing for large collections
- [ ] Custom CSS themes for different regions/cultures

## 🆕 Markup Persistence Feature

The Homebrewery export now includes automatic markup persistence! This feature automatically generates and stores Homebrewery V3 markup in the database, making exports much faster.

### Database Migration

First, run the migration to add the `monster_markup_homebrew` column:

```bash
ts-node -r tsconfig-paths/register --project tsconfig.json src/scripts/run-homebrewery-migration.ts
```

### Automatic Markup Generation

When a monster is generated and saved to the database, the Homebrewery markup is automatically generated and stored in the `monster_markup_homebrew` column.

### Populate Existing Monsters

To populate markup for existing monsters:

```typescript
import { populateAllHomebreweryMarkup } from '../lib/utils/monster-markup-persistence';

const result = await populateAllHomebreweryMarkup();
console.log(`Processed ${result.processed} monsters`);
```

### Fast Exports

The export utilities now check for pre-generated markup first, falling back to on-the-fly generation if needed:

```typescript
import { getHomebreweryMarkup } from '../lib/utils/monster-markup-persistence';

const result = await getHomebreweryMarkup(monsterId);
if (result.success) {
  console.log(`Markup: ${result.markup}`);
}
```

### Test the Feature

```bash
ts-node -r tsconfig-paths/register --project tsconfig.json src/scripts/test-markup-persistence.ts
``` 

## 🏠 Homebrewery V3 Export Feature - Updated!

I've successfully updated your Homebrewery export feature to align with the latest V3 specifications. Here are the key improvements:

### ✅ V3 Optimizations Made:

1. **Enhanced Spacing Control**
   - Uses `:` characters for better vertical spacing instead of empty lines
   - More consistent spacing throughout stat blocks

2. **Style Editor Panel Integration**
   - Custom styling now generates comments for the Style Editor Panel
   - No more inline `<style>` tags (V3 prefers the Style Editor Panel)

3. **V3 Page Breaks**
   - Uses `\page` instead of HTML `<div>` for page breaks
   - Better compatibility with V3's rendering engine

4. **New V3-Style Function**
   - Added `generateHomebreweryV3StatBlock()` for optimized V3 formatting
   - Enhanced spacing and formatting specifically for V3

5. **Updated Documentation**
   - Comprehensive V3 feature explanations
   - Tips for using the Style Editor Panel
   - Examples of V3 syntax and features

###  Generated Files:

The test now creates 6 different export formats:
- `test-output-homebrewery-basic.md` - Basic monster export
- `test-output-homebrewery-full.md` - Full monster with all sections  
- `test-output-homebrewery-statblock.md` - Stat block only
- `test-output-homebrewery-collection.md` - Collection of multiple monsters
- `test-output-homebrewery-styled.md` - Monster with custom styling
- `test-output-homebrewery-v3.md` - **NEW: V3-optimized stat block**

### 🎯 Key V3 Features Supported:

- **Curly Bracket Syntax**: Ready for `{{ }}` custom formatting
- **Enhanced Spacing**: Uses `:` for better vertical control
- **Style Editor Panel**: CSS suggestions in comments
- **Page Breaks**: Uses `\page` for proper V3 page breaks
- **Improved Formatting**: Better stat block layout

###  How to Use:

1. **Test the V3 export**:
   ```bash
   ts-node -r tsconfig-paths/register --project tsconfig.json src/scripts/test-homebrewery-export.ts
   ```

2. **Use in Homebrewery V3**:
   - Copy content from any generated `.md` file
   - Paste into [https://homebrewery.naturalcrit.com/](https://homebrewery.naturalcrit.com/)
   - Add suggested CSS to the Style Editor Panel
   - Preview and generate PDFs

3. **For V3-optimized exports**:
   ```typescript
   import { generateHomebreweryV3StatBlock } from '../lib/utils/homebrewery-export';
   const v3Markup = generateHomebreweryV3StatBlock(monsterJson);
   ```

The export now perfectly aligns with Homebrewery V3's enhanced features and will create beautiful, professional-looking D&D 5e documents that look like official content! 🎉 