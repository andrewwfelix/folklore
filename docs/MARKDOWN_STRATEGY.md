### Markdown Strategy for Automating D&D Stat Blocks in InDesign

#### Objective

To format LLM-generated D&D 5E stat blocks using structured JSON enriched with lightweight markup that aligns with InDesign's built-in paragraph and character styles, leveraging GREP styles wherever possible.

---

### ✅ Why Preprocess Formatting in JSON?

| Benefit                     | Explanation                                                        |
| --------------------------- | ------------------------------------------------------------------ |
| Separation of concerns      | LLM handles language + formatting; script only maps tags to styles |
| Easier automation           | Pre-tagged content simplifies scripting logic                      |
| Output flexibility          | Same JSON can be reused for web, PDF, or HTML formats              |
| Reusability and consistency | Formatting stays consistent across all monster blocks              |

---

### 🔧 Suggested Markup Format

#### Option A: HTML-style (Recommended for InDesign scripting)

```json
"Description": "<b>Multiattack.</b> The creature makes two attacks: one with its bite and one with its claws."
```

#### Option B: Markdown-style

```json
"Description": "**Multiattack.** The creature makes two attacks..."
```

Use consistent inline markup for:

- `<b>` or `**` → bold names or section headers
- `<i>` or `*` → italicized mechanics (e.g., "*Melee Weapon Attack:*")
- `\n\n` → line breaks between abilities or actions

---

### 🧠 What to Preprocess in the JSON

| Element         | Markup Suggestion                  |
| --------------- | ---------------------------------- |
| Bold headers    | `<b>Multiattack.</b>` or `**...**` |
| Italic phrases  | `<i>Melee Weapon Attack:</i>`      |
| Section headers | Uppercase, bold, or separate field |
| Dice notation   | Use parentheses: `(2d6 + 3)`       |
| Line breaks     | `\n\n` or `<br>`                   |

---

### 🧰 Use GREP Styles in InDesign

| Goal                                  | GREP Pattern           | Applied Style |          |
| ------------------------------------- | ---------------------- | ------------- | -------- |
| Bold first phrase ending in colon     | `^.+?:`                | `Bold`        |          |
| Italicize "Melee Weapon Attack:" etc. | \`Melee Weapon Attack: | Hit:\`        | `Italic` |
| Format dice rolls                     | `\(\d+d\d+ \+ \d+\)`   | `Dice`        |          |
| Section header in all caps            | `^[A-Z\s]+$`           | `HeaderCaps`  |          |

---

### 🧭 Workflow Summary

1. **LLM generates JSON** with simple markup
2. **Script parses** JSON, inserts content into InDesign text frames
3. **Paragraph styles** applied during insertion
4. **GREP styles** apply inline formatting automatically
5. Export as PDF or InDesign document

---

### 🏁 Benefits

- Clean, readable source JSON
- Highly maintainable automation workflow
- Fast layout generation of professional-grade D&D content
- Reusable styling for other projects (e.g., spells, NPCs, items)

---

Let me know if you want to expand this into a full scripting guide or add examples for spell or lore formatting.

