import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * Export monster data to The Homebrewery format
 * The Homebrewery: https://homebrewery.naturalcrit.com/
 * 
 * This format uses specific markdown styling to create D&D 5e style stat blocks
 * that look like official content when rendered.
 */

export interface HomebreweryExportOptions {
  includeLore?: boolean;
  includeCitations?: boolean;
  includeArtPrompt?: boolean;
  frameType?: 'monster' | 'monster,frame' | 'monster,frame,wide';
  customStyling?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

function normalizeKey(obj: any, keys: string[]): any {
  for (const key of keys) {
    if (obj[key] !== undefined) return obj[key];
    // Try lowercased, uppercased, and snake_case
    const lower = key.toLowerCase();
    const upper = key.toUpperCase();
    const snake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    if (obj[lower] !== undefined) return obj[lower];
    if (obj[upper] !== undefined) return obj[upper];
    if (obj[snake] !== undefined) return obj[snake];
  }
  return undefined;
}

function transformStatblockForHomebrewery(stat: any): any {
  if (!stat) return {};
  let statData = stat;
  if (stat.Creature && typeof stat.Creature === 'object') {
    statData = stat.Creature;
  } else if (stat.Creature && typeof stat.Creature === 'string') {
    statData = stat;
  }

  const transformed: any = {};

  // Name, Size, Type, Alignment
  transformed.name = normalizeKey(statData, ['Name', 'name', 'Creature', 'Creature_Name']);
  transformed.size = normalizeKey(statData, ['Size', 'size']);
  transformed.type = normalizeKey(statData, ['Type', 'type']);
  transformed.alignment = normalizeKey(statData, ['Alignment', 'alignment']);

  // AC, HP, Hit Dice
  transformed.armorClass = normalizeKey(statData, ['AC', 'ArmorClass', 'Armor_Class', 'armor_class']);
  transformed.armorType = normalizeKey(statData, ['ArmorType', 'armorType', 'armor_type']);
  transformed.hitPoints = normalizeKey(statData, ['HP', 'HitPoints', 'Hit_Points', 'hit_points']);
  transformed.hitDice = normalizeKey(statData, ['HitDice', 'hitDice', 'hit_dice']);

  // Speed (string or object)
  let speed = normalizeKey(statData, ['Speed', 'speed']);
  if (typeof speed === 'string') {
    transformed.speed = speed;
  } else if (typeof speed === 'object' && speed !== null) {
    transformed.speed = Object.entries(speed).map(([k, v]) => `${k} ${v} ft.`).join(', ');
  }

  // Challenge Rating, XP
  transformed.challengeRating = normalizeKey(statData, ['Challenge', 'challengeRating', 'ChallengeRating', 'challenge_rating', 'Challenge_Rating']);
  transformed.experiencePoints = normalizeKey(statData, ['experiencePoints', 'ExperiencePoints', 'experience_points', 'Experience_Points']);

  // Languages
  let languages = normalizeKey(statData, ['Languages', 'languages']);
  if (Array.isArray(languages)) {
    transformed.languages = languages.join(', ');
  } else {
    transformed.languages = languages;
  }

  // Damage Resistances, Immunities, Condition Immunities
  transformed.damageResistances = normalizeKey(statData, ['DamageResistances', 'damageResistances', 'damage_resistances', 'Damage_Resistances']);
  transformed.damageImmunities = normalizeKey(statData, ['DamageImmunities', 'damageImmunities', 'damage_immunities', 'Damage_Immunities']);
  transformed.conditionImmunities = normalizeKey(statData, ['ConditionImmunities', 'conditionImmunities', 'condition_immunities', 'Condition_Immunities']);

  // Senses (string or object)
  let senses = normalizeKey(statData, ['Senses', 'senses']);
  if (typeof senses === 'string') {
    transformed.senses = senses;
  } else if (typeof senses === 'object' && senses !== null) {
    transformed.senses = Object.entries(senses).map(([k, v]) => `${k} ${v} ft.`).join(', ');
  }

  // Ability Scores
  let abilityScores = normalizeKey(statData, ['AbilityScores', 'abilityScores', 'Ability_Scores', 'ability_scores']);
  if (abilityScores) {
    transformed.abilityScores = {
      str: abilityScores.STR || abilityScores.str || abilityScores.Strength || abilityScores.strength,
      dex: abilityScores.DEX || abilityScores.dex || abilityScores.Dexterity || abilityScores.dexterity,
      con: abilityScores.CON || abilityScores.con || abilityScores.Constitution || abilityScores.constitution,
      int: abilityScores.INT || abilityScores.int || abilityScores.Intelligence || abilityScores.intelligence,
      wis: abilityScores.WIS || abilityScores.wis || abilityScores.Wisdom || abilityScores.wisdom,
      cha: abilityScores.CHA || abilityScores.cha || abilityScores.Charisma || abilityScores.charisma
    };
  }

  // Saving Throws
  let savingThrows = normalizeKey(statData, ['SavingThrows', 'savingThrows', 'Saving_Throws', 'saving_throws']);
  if (savingThrows && typeof savingThrows === 'object') {
    transformed.savingThrows = {};
    for (const key of Object.keys(savingThrows)) {
      if (!key) continue;
      const val = savingThrows[key];
      const short = key.slice(0, 3).toLowerCase();
      transformed.savingThrows[short] = typeof val === 'string' ? parseInt(val.replace('+', '')) || val : val;
    }
  }

  // Skills
  let skills = normalizeKey(statData, ['Skills', 'skills']);
  if (skills && typeof skills === 'object') {
    transformed.skills = {};
    for (const key of Object.keys(skills)) {
      if (!key) continue;
      const val = skills[key];
      transformed.skills[key] = typeof val === 'string' ? parseInt(val.replace('+', '')) || val : val;
    }
  }

  // Traits, Actions, Legendary Actions, Lair Actions
  let traits = normalizeKey(statData, ['Traits', 'traits', 'SpecialAbilities', 'Special_Abilities', 'special_abilities']);
  if (traits && Array.isArray(traits)) {
    transformed.traits = traits.map(t => {
      let name = '';
      let description = '';
      if (t && typeof t === 'object') {
        const keys = Object.keys(t);
        name = t.Name || t.name || (keys.length > 0 ? keys[0] : '');
        description = t.Description || t.description || (keys.length > 0 && keys[0] ? t[keys[0]] : '');
      }
      return { name, description: description || '' };
    });
  }
  let actions = normalizeKey(statData, ['Actions', 'actions']);
  if (actions && Array.isArray(actions)) {
    transformed.actions = actions.map(a => {
      let name = '';
      let description = '';
      if (a && typeof a === 'object') {
        const keys = Object.keys(a);
        name = a.Name || a.name || (keys.length > 0 ? keys[0] : '');
        description = a.Description || a.description || (keys.length > 0 && keys[0] ? a[keys[0]] : '');
      }
      return { name, description: description || '' };
    });
  }
  let legendaryActions = normalizeKey(statData, ['LegendaryActions', 'legendaryActions', 'Legendary_Actions', 'legendary_actions']);
  if (legendaryActions && Array.isArray(legendaryActions)) {
    transformed.legendaryActions = legendaryActions.map(a => {
      let name = '';
      let description = '';
      if (a && typeof a === 'object') {
        const keys = Object.keys(a);
        name = a.Name || a.name || (keys.length > 0 ? keys[0] : '');
        description = a.Description || a.description || (keys.length > 0 && keys[0] ? a[keys[0]] : '');
      }
      return { name, description: description || '' };
    });
  }
  let lairActions = normalizeKey(statData, ['LairActions', 'lairActions', 'Lair_Actions', 'lair_actions']);
  if (lairActions && Array.isArray(lairActions)) {
    transformed.lairActions = lairActions.map(a => {
      let name = '';
      let description = '';
      if (a && typeof a === 'object') {
        const keys = Object.keys(a);
        name = a.Name || a.name || (keys.length > 0 ? keys[0] : '');
        description = a.Description || a.description || (keys.length > 0 && keys[0] ? a[keys[0]] : '');
      }
      return { name, description: description || '' };
    });
  }

  return transformed;
}

export function generateHomebreweryMarkup(
  monsterJson: any, 
  options: HomebreweryExportOptions = {}
): string {
  if (!monsterJson) return '';

  const {
    includeLore = true,
    includeCitations = false,
    includeArtPrompt = false,
    frameType = 'monster,frame',
    customStyling = {}
  } = options;

  // Helper functions for V3 formatting
  function getMonsterType(monster: any): string {
    const tags = monster.tags || [];
    const category = tags[0] || 'monster';
    const size = 'Large'; // Default size, could be determined from CR or other factors
    const alignment = 'neutral'; // Default alignment
    return `${size} ${category}, ${alignment}`;
  }

  function formatTraitsV3(traits: any[]) {
    if (!traits || !traits.length) return '';
    return traits.map(trait => {
      let desc = trait.description.trim();
      return `***${trait.name}.*** ${desc}`;
    }).join('\n:\n');
  }

  function formatActionsV3(actions: any[]) {
    if (!actions || !actions.length) return '';
    return actions.map(action => {
      let desc = (action.description || '').trim();
      desc = desc.replace(/(Melee Weapon Attack:|Ranged Weapon Attack:)/g, '*$1*');
      desc = desc.replace(/(Hit:)/g, '*$1*');
      return `***${action.name}.*** ${desc}`;
    }).join('\n:\n');
  }

  function formatLegendaryActionsV3(legendaryActions: any[]) {
    if (!legendaryActions || !legendaryActions.length) return '';
    return legendaryActions.map(la => {
      let desc = la.description.trim();
      return `***${la.name}.*** ${desc}`;
    }).join('\n:\n');
  }

  function formatLairActionsV3(lairActions: any[]) {
    if (!lairActions || !lairActions.length) return '';
    return lairActions.map(la => {
      let desc = la.description.trim();
      return `***${la.name}.*** ${desc}`;
    }).join('\n:\n');
  }

  // Helper to extract lore content from JSONB structure
  function extractLoreContent(lore: any): string {
    if (!lore) return '';

    // If it's a string, try to parse as JSON first
    if (typeof lore === 'string') {
      try {
        const parsed = JSON.parse(lore);
        if (typeof parsed === 'object' && parsed !== null) {
          lore = parsed;
        } else {
          return lore;
        }
      } catch (e) {
        // Not JSON, return as-is
        return lore;
      }
    }

    // Handle nested structure from real generation
    if (typeof lore === 'object' && lore !== null) {
      // Check for nested Creature structure
      if (lore.Creature && lore.Creature.Description) {
        let md = '';
        const desc = lore.Creature.Description;
        
        if (desc.PhysicalAppearance) md += `**Physical Appearance** : ${desc.PhysicalAppearance}\n:\n`;
        if (desc.Behavior) md += `**Behavior** : ${desc.Behavior}\n:\n`;
        
        if (lore.Creature.CulturalSignificance) {
          const cult = lore.Creature.CulturalSignificance;
          if (cult.Symbolism) md += `**Symbolism** : ${cult.Symbolism}\n:\n`;
          if (cult.Festivals) md += `**Festivals** : ${cult.Festivals}\n:\n`;
        }
        
        if (lore.Creature.NotableAbilities) {
          const abilities = lore.Creature.NotableAbilities;
          let abilitiesText = '';
          if (abilities.Powers) abilitiesText += `Powers: ${abilities.Powers}`;
          if (abilities.Wisdom) abilitiesText += ` Wisdom: ${abilities.Wisdom}`;
          if (abilitiesText) md += `**Notable Abilities** : ${abilitiesText}\n:\n`;
        }
        
        if (lore.Creature.HistoricalContext) {
          const hist = lore.Creature.HistoricalContext;
          let contextText = '';
          if (hist.AncientBeliefs) contextText += `Ancient Beliefs: ${hist.AncientBeliefs}`;
          if (hist.ModernUse) contextText += ` Modern Use: ${hist.ModernUse}`;
          if (contextText) md += `**Historical Context** : ${contextText}\n:\n`;
        }
        
        return md.trim();
      }
      
      // Legacy structure handling
      let md = '';
      // Description
      if (lore.Description) {
        if (lore.Description.General) md += `**General** : ${lore.Description.General}\n:\n`;
        if (lore.Description.Physical) md += `**Physical** : ${lore.Description.Physical}\n:\n`;
        if (lore.Description.Habitat) md += `**Habitat** : ${lore.Description.Habitat}\n:\n`;
      }
      // Cultural Significance
      if (lore.Cultural_Significance) {
        if (lore.Cultural_Significance.Role) md += `**Cultural Significance** : ${lore.Cultural_Significance.Role}\n:\n`;
        if (lore.Cultural_Significance.Symbols) md += `**Symbols** : ${lore.Cultural_Significance.Symbols}\n:\n`;
      }
      // Notable Abilities
      if (lore.Notable_Abilities) {
        let abilities = '';
        if (lore.Notable_Abilities.Magic) abilities += `Magic: ${lore.Notable_Abilities.Magic}`;
        if (lore.Notable_Abilities.Flight) abilities += ` Flight: ${lore.Notable_Abilities.Flight}`;
        if (abilities) md += `**Notable Abilities** : ${abilities}\n:\n`;
      }
      // Historical Context
      if (lore.Historical_Context) {
        let context = '';
        if (lore.Historical_Context.Literature) context += `Literature: ${lore.Historical_Context.Literature}`;
        if (lore.Historical_Context.Modern_Adaptations) context += ` Modern Adaptations: ${lore.Historical_Context.Modern_Adaptations}`;
        if (context) md += `**Historical Context** : ${context}\n:\n`;
      }
      // Fallback: Creature and Region
      if (!md.trim() && (lore.Creature || lore.Region)) {
        md = `A ${lore.Creature || 'mystical creature'} from ${lore.Region || 'ancient folklore'}.`;
      }
      // If still empty, try legacy fields
      if (!md.trim()) {
        if (lore.content) return lore.content;
        if (lore.text) return lore.text;
        if (lore.description) return lore.description;
        if (lore.lore) return lore.lore;
      }
      return md.trim();
    }

    return '';
  }

  // Helper to format ability scores for Homebrewery
  function formatModifier(score: number) {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  // Extract data
  const loreContent = extractLoreContent(monsterJson.lore);
  const stat = monsterJson.statblock || {};
  // Transform statblock data to match Homebrewery format
  const transformedStat = transformStatblockForHomebrewery(stat);

  // Build the Homebrewery markdown
  const sections = [];

  // Custom styling (Homebrewery V3 uses Style Editor Panel)
  // Note: Custom styling should be added to the Style Editor Panel in Homebrewery
  if (customStyling.backgroundColor || customStyling.textColor || customStyling.accentColor) {
    sections.push('<!-- Custom styling - Add to Style Editor Panel:');
    if (customStyling.backgroundColor) {
      sections.push(`.phb { background-color: ${customStyling.backgroundColor}; }`);
    }
    if (customStyling.textColor) {
      sections.push(`.phb { color: ${customStyling.textColor}; }`);
    }
    if (customStyling.accentColor) {
      sections.push(`.phb h1, .phb h2, .phb h3 { color: ${customStyling.accentColor}; }`);
    }
    sections.push('-->');
    sections.push('');
  }

  // Monster name as main heading
  sections.push(`# ${monsterJson.name}`);
  sections.push('');

  // Lore section (if enabled)
  if (includeLore && loreContent) {
    sections.push('## Lore');
    sections.push('');
    sections.push(loreContent);
    sections.push('');
  }

  // Stat block
  sections.push('## Stat Block');
  sections.push('');

  // Stat block content with proper V3 formatting
  const statBlockLines = [
    `{{${frameType}`,
    `## ${monsterJson.name}`,
    `*${getMonsterType(monsterJson)}*`,
    '___',
    `**Armor Class** :: ${transformedStat.armorClass?.toString() + (transformedStat.armorType ? ` (${transformedStat.armorType})` : '')}`,
    `**Hit Points**  :: ${transformedStat.hitPoints?.toString() + (transformedStat.hitDice ? ` (${transformedStat.hitDice})` : '')}`,
    `**Speed**       :: ${transformedStat.speed ? Object.entries(transformedStat.speed).map(([k, v]) => {
      const value = v as unknown;
      let val = '';
      if (typeof value === 'number' || typeof value === 'string') val = String(value);
      return `${k} ${val} ft.`;
    }).join(', ') : ''}`,
    '___',
    '|  STR  |  DEX  |  CON  |  INT  |  WIS  |  CHA  |',
    '|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|',
    `|${transformedStat.abilityScores?.str} (${formatModifier(transformedStat.abilityScores?.str)})|${transformedStat.abilityScores?.dex} (${formatModifier(transformedStat.abilityScores?.dex)})|${transformedStat.abilityScores?.con} (${formatModifier(transformedStat.abilityScores?.con)})|${transformedStat.abilityScores?.int} (${formatModifier(transformedStat.abilityScores?.int)})|${transformedStat.abilityScores?.wis} (${formatModifier(transformedStat.abilityScores?.wis)})|${transformedStat.abilityScores?.cha} (${formatModifier(transformedStat.abilityScores?.cha)})|`,
    '___',
    transformedStat.damageResistances ? `**Damage Resistances** :: ${transformedStat.damageResistances}` : '',
    transformedStat.damageImmunities ? `**Damage Immunities** :: ${transformedStat.damageImmunities}` : '',
    transformedStat.conditionImmunities ? `**Condition Immunities** :: ${transformedStat.conditionImmunities}` : '',
    transformedStat.senses ? `**Senses**               :: ${Object.entries(transformedStat.senses).map(([k, v]) => {
      const value = v as unknown;
      let val = '';
      if (typeof value === 'number' || typeof value === 'string') val = String(value);
      return k === 'passivePerception' ? `passive Perception ${val}` : `${k} ${val} ft.`;
    }).join(', ')}` : '',
    transformedStat.languages ? `**Languages**            :: ${Array.isArray(transformedStat.languages) ? transformedStat.languages.join(', ') : transformedStat.languages}` : '',
    transformedStat.challengeRating ? `**Challenge**            :: ${transformedStat.challengeRating} (${transformedStat.experiencePoints} XP)` : '',
    '___',
    formatTraitsV3(transformedStat.traits),
    transformedStat.actions ? '\n:\n### Actions\n' + formatActionsV3(transformedStat.actions) : '',
    transformedStat.legendaryActions ? '\n:\n### Legendary Actions\n' + formatLegendaryActionsV3(transformedStat.legendaryActions) : '',
    transformedStat.lairActions ? '\n:\n### Lair Actions\n' + formatLairActionsV3(transformedStat.lairActions) : '',
    '}}',
  ].filter(Boolean);

  sections.push(statBlockLines.join('\n'));

  // Citations section (if enabled)
  if (includeCitations && monsterJson.citations && monsterJson.citations.length > 0) {
    sections.push('');
    sections.push('## Sources');
    sections.push('');
    monsterJson.citations.forEach((citation: any, index: number) => {
      sections.push(`${index + 1}. ${citation.title || citation.source || 'Unknown Source'}`);
      if (citation.url) {
        sections.push(`   ${citation.url}`);
      }
      sections.push('');
    });
  }

  // Art prompt section (if enabled)
  if (includeArtPrompt && monsterJson.art) {
    sections.push('');
    sections.push('## Art Description');
    sections.push('');
    sections.push(monsterJson.art.prompt || monsterJson.art.description || 'No art description available.');
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Generate a complete Homebrewery document with multiple monsters
 */
export function generateHomebreweryCollection(
  monsters: any[], 
  title: string = 'Folklore Monsters Collection',
  options: HomebreweryExportOptions = {}
): string {
  const sections = [];

  // Document title
  sections.push(`# ${title}`);
  sections.push('');

  // Add each monster
  monsters.forEach((monster, index) => {
    sections.push(generateHomebreweryMarkup(monster, options));
    
    // Add page break between monsters (except for the last one)
    if (index < monsters.length - 1) {
      sections.push('');
      sections.push('\\page');
      sections.push('');
    }
  });

  return sections.join('\n');
}

/**
 * Generate a simple stat block only (without lore, citations, etc.)
 */
export function generateHomebreweryStatBlock(monsterJson: any): string {
  return generateHomebreweryMarkup(monsterJson, {
    includeLore: false,
    includeCitations: false,
    includeArtPrompt: false
  });
}

/**
 * Generate a V3-style monster stat block with enhanced formatting
 */
export function generateHomebreweryV3StatBlock(monsterJson: any): string {
  if (!monsterJson) return '';

  // Helper to extract lore content from JSONB structure
  function extractLoreContent(lore: any): string {
    if (!lore) return '';
    
    if (typeof lore === 'string') {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(lore);
        if (typeof parsed === 'object' && parsed !== null) {
          // Extract readable content from JSON structure
          if (parsed.Creature_Description?.Physical_Attributes) {
            return parsed.Creature_Description.Physical_Attributes;
          }
          if (parsed.content) {
            return parsed.content;
          }
          if (parsed.text) {
            return parsed.text;
          }
          if (parsed.description) {
            return parsed.description;
          }
          if (parsed.lore) {
            return parsed.lore;
          }
          // If no specific field found, return a readable summary
          return `A ${parsed.Creature || 'mystical creature'} from ${parsed.Region || 'ancient folklore'}.`;
        }
      } catch (e) {
        // If it's not valid JSON, return as-is
        return lore;
      }
      return lore;
    }
    
    if (typeof lore === 'object' && lore !== null) {
      if (lore.content) {
        return lore.content;
      }
      if (lore.text) return lore.text;
      if (lore.description) return lore.description;
      if (lore.lore) return lore.lore;
    }
    
    return '';
  }

  // Helper to format ability scores for V3
  function formatModifier(score: number) {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  function formatTraits(traits: any[]) {
    if (!traits || !traits.length) return '';
    return traits.map(trait => `***${trait.name}.*** ${trait.description}`).join('\n\n');
  }

  function formatActions(actions: any[]) {
    if (!actions || !actions.length) return '';
    return actions.map(action => {
      let desc = action.description || '';
      // V3 uses italics for attack descriptions
      desc = desc.replace(/(Melee Weapon Attack:|Ranged Weapon Attack:)/g, '*$1*');
      desc = desc.replace(/(Hit:)/g, '*$1*');
      return `***${action.name}.*** ${desc}`;
    }).join('\n\n');
  }

  function formatLegendaryActions(legendaryActions: any[]) {
    if (!legendaryActions || !legendaryActions.length) return '';
    return legendaryActions.map(la => `***${la.name}.*** ${la.description}`).join('\n\n');
  }

  function formatLairActions(lairActions: any[]) {
    if (!lairActions || !lairActions.length) return '';
    return lairActions.map(la => `***${la.name}.*** ${la.description}`).join('\n\n');
  }

  // Extract data
  const loreContent = extractLoreContent(monsterJson.lore);
  const stat = monsterJson.statblock || {};

  // Build V3-style stat block
  const sections = [];

  // Monster name as main heading
  sections.push(`# ${monsterJson.name}`);
  sections.push('');

  // Lore section if present
  if (loreContent) {
    sections.push('## Lore');
    sections.push('');
    sections.push(loreContent);
    sections.push(':');
  }

  // Stat block with V3 spacing
  // Apply transformation for V3 as well
  const transformedStat = transformStatblockForHomebrewery(stat);
  const statBlockLines = [
    `**Armor Class** ${transformedStat.armorClass?.toString() + (transformedStat.armorType ? ` (${transformedStat.armorType})` : '')}`,
    `**Hit Points** ${transformedStat.hitPoints?.toString() + (transformedStat.hitDice ? ` (${transformedStat.hitDice})` : '')}`,
    `**Speed** ${transformedStat.speed ? Object.entries(transformedStat.speed).map(([k, v]) => {
      const value = v as unknown;
      let val = '';
      if (typeof value === 'number' || typeof value === 'string') val = String(value);
      return `${k} ${val} ft.`;
    }).join(', ') : ''}`,
    '',
    `**STR** ${transformedStat.abilityScores?.str} (${formatModifier(transformedStat.abilityScores?.str)})`,
    `**DEX** ${transformedStat.abilityScores?.dex} (${formatModifier(transformedStat.abilityScores?.dex)})`,
    `**CON** ${transformedStat.abilityScores?.con} (${formatModifier(transformedStat.abilityScores?.con)})`,
    `**INT** ${transformedStat.abilityScores?.int} (${formatModifier(transformedStat.abilityScores?.int)})`,
    `**WIS** ${transformedStat.abilityScores?.wis} (${formatModifier(transformedStat.abilityScores?.wis)})`,
    `**CHA** ${transformedStat.abilityScores?.cha} (${formatModifier(transformedStat.abilityScores?.cha)})`,
    '',
    transformedStat.savingThrows ? `**Saving Throws** ${Object.entries(transformedStat.savingThrows).map(([k, v]) => {
      let val = '';
      if (typeof v === 'number' || typeof v === 'string') val = String(v);
      return `${capitalize(k)} ${val && Number(val) >= 0 ? '+' : ''}${val}`;
    }).join(', ')}` : '',
    transformedStat.skills ? `**Skills** ${Object.entries(transformedStat.skills).map(([k, v]) => {
      let val = '';
      if (typeof v === 'number' || typeof v === 'string') val = String(v);
      return `${capitalize(k)} ${val && Number(val) >= 0 ? '+' : ''}${val}`;
    }).join(', ')}` : '',
    transformedStat.damageResistances ? `**Damage Resistances** ${transformedStat.damageResistances}` : '',
    transformedStat.damageImmunities ? `**Damage Immunities** ${transformedStat.damageImmunities}` : '',
    transformedStat.conditionImmunities ? `**Condition Immunities** ${transformedStat.conditionImmunities}` : '',
    transformedStat.senses ? `**Senses** ${Object.entries(transformedStat.senses).map(([k, v]) => {
      const value = v as unknown;
      let val = '';
      if (typeof value === 'number' || typeof value === 'string') val = String(value);
      return k === 'passivePerception' ? `passive Perception ${val}` : `${k} ${val} ft.`;
    }).join(', ')}` : '',
    transformedStat.languages ? `**Languages** ${Array.isArray(transformedStat.languages) ? transformedStat.languages.join(', ') : transformedStat.languages}` : '',
    transformedStat.challengeRating ? `**Challenge** ${transformedStat.challengeRating} (${transformedStat.experiencePoints} XP)` : '',
    '',
    formatTraits(transformedStat.traits),
    transformedStat.actions ? '\n:\n***ACTIONS***\n' + formatActions(transformedStat.actions) : '',
    transformedStat.legendaryActions ? '\n:\n***LEGENDARY ACTIONS***\n' + formatLegendaryActions(transformedStat.legendaryActions) : '',
    transformedStat.lairActions ? '\n:\n***LAIR ACTIONS***\n' + formatLairActions(transformedStat.lairActions) : '',
  ].filter(Boolean);

  sections.push(statBlockLines.join('\n'));

  return sections.join('\n');
}

function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}