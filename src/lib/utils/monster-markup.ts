// Utility to convert monster JSON to Markdown-formatted stat block
// Follows rules from MARKDOWN_RULES.md and MARKDOWN_STRATEGY.md

export function generateMonsterMarkup(monsterJson: any): string {
  if (!monsterJson) return '';

  // Helper to extract lore content from JSONB structure
  function extractLoreContent(lore: any): string {
    if (!lore) return '';
    
    // Handle different lore formats
    if (typeof lore === 'string') {
      return lore; // Legacy string format
    }
    
    if (typeof lore === 'object' && lore !== null) {
      // New JSONB format: {content: "...", format: "...", metadata: {...}}
      if (lore.content) {
        return lore.content;
      }
      
      // Fallback: try to find content in various possible structures
      if (lore.text) return lore.text;
      if (lore.description) return lore.description;
      if (lore.lore) return lore.lore;
    }
    
    return '';
  }

  // Helper to format ability scores
  function formatAbilityScores(abilities: any) {
    if (!abilities) return '';
    
    // Handle different ability score formats
    const scores = {
      str: abilities.str || abilities.strength,
      dex: abilities.dex || abilities.dexterity,
      con: abilities.con || abilities.constitution,
      int: abilities.int || abilities.intelligence,
      wis: abilities.wis || abilities.wisdom,
      cha: abilities.cha || abilities.charisma
    };
    
    return [
      `**STR** ${scores.str} (${formatModifier(scores.str)})`,
      `**DEX** ${scores.dex} (${formatModifier(scores.dex)})`,
      `**CON** ${scores.con} (${formatModifier(scores.con)})`,
      `**INT** ${scores.int} (${formatModifier(scores.int)})`,
      `**WIS** ${scores.wis} (${formatModifier(scores.wis)})`,
      `**CHA** ${scores.cha} (${formatModifier(scores.cha)})`,
    ].join('  ');
  }

  function formatModifier(score: number) {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  function formatSection(title: string, value: string) {
    return `**${title.toUpperCase()}** ${value}`;
  }

  function formatTraits(traits: any[]) {
    if (!traits || !traits.length) return '';
    return traits.map(trait => `**${trait.name}.** ${trait.description}`).join('\n\n');
  }

  function formatActions(actions: any[]) {
    if (!actions || !actions.length) return '';
    return actions.map(action => {
      let desc = action.description || '';
      // Italicize "Melee Weapon Attack:" and "Hit:" if present
      desc = desc.replace(/(Melee Weapon Attack:|Ranged Weapon Attack:)/g, '*$1*');
      desc = desc.replace(/(Hit:)/g, '*$1*');
      return `**${action.name}.** ${desc}`;
    }).join('\n\n');
  }

  function formatLegendaryActions(legendaryActions: any[]) {
    if (!legendaryActions || !legendaryActions.length) return '';
    return legendaryActions.map(la => `**${la.name}.** ${la.description}`).join('\n\n');
  }

  function formatLairActions(lairActions: any[]) {
    if (!lairActions || !lairActions.length) return '';
    return lairActions.map(la => `**${la.name}.** ${la.description}`).join('\n\n');
  }

  // Extract lore content
  const loreContent = extractLoreContent(monsterJson.lore);

  // Main stat block fields
  const stat = monsterJson.statblock || {};
  const lines = [
    // Include lore at the top if present
    loreContent ? `**LORE**\n${loreContent}\n` : '',
    formatSection('Armor Class', stat.armorClass?.toString() + (stat.armorType ? ` (${stat.armorType})` : '')),
    formatSection('Hit Points', stat.hitPoints?.toString() + (stat.hitDice ? ` (${stat.hitDice})` : '')),
    formatSection('Speed', stat.speed ? Object.entries(stat.speed).map(([k, v]) => {
      const value = v as unknown;
      let val = '';
      if (typeof value === 'number' || typeof value === 'string') val = String(value);
      return `${k} ${val} ft.`;
    }).join(', ') : ''),
    '',
    formatAbilityScores(stat.abilityScores),
    '',
    stat.savingThrows ? formatSection('Saving Throws', Object.entries(stat.savingThrows).map(([k, v]) => {
      let val = '';
      if (typeof v === 'number' || typeof v === 'string') val = String(v);
      // Remove any existing + signs and add properly
      val = val.replace(/^\+/, ''); // Remove leading +
      return `${capitalize(k)} ${val && Number(val) >= 0 ? '+' : ''}${val}`;
    }).join(', ')) : '',
    stat.skills ? formatSection('Skills', Object.entries(stat.skills).map(([k, v]) => {
      let val = '';
      if (typeof v === 'number' || typeof v === 'string') val = String(v);
      // Remove any existing + signs and add properly
      val = val.replace(/^\+/, ''); // Remove leading +
      return `${capitalize(k)} ${val && Number(val) >= 0 ? '+' : ''}${val}`;
    }).join(', ')) : '',
    stat.damageResistances ? formatSection('Damage Resistances', stat.damageResistances) : '',
    stat.damageImmunities ? formatSection('Damage Immunities', stat.damageImmunities) : '',
    stat.conditionImmunities ? formatSection('Condition Immunities', stat.conditionImmunities) : '',
    stat.senses ? formatSection('Senses', Object.entries(stat.senses).map(([k, v]) => {
      const value = v as unknown;
      let val = '';
      if (typeof value === 'number' || typeof value === 'string') val = String(value);
      return k === 'passivePerception' ? `passive Perception ${val}` : `${k} ${val} ft.`;
    }).join(', ')) : '',
    stat.languages ? formatSection('Languages', stat.languages.join(', ')) : '',
    stat.challengeRating ? formatSection('Challenge', `${stat.challengeRating} (${stat.experiencePoints} XP)`) : '',
    '',
    formatTraits(stat.traits),
    stat.actions ? '\n:\n**ACTIONS**\n' + formatActions(stat.actions) : '',
    stat.legendaryActions ? '\n:\n**LEGENDARY ACTIONS**\n' + formatLegendaryActions(stat.legendaryActions) : '',
    stat.lairActions ? '\n:\n**LAIR ACTIONS**\n' + formatLairActions(stat.lairActions) : '',
  ].filter(Boolean);

  return lines.join('\n');
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
} 