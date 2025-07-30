The `home` command currently displays hardcoded content, leading to semantic drift from its intended dynamic content loading from `content/homestead.md`. This issue tracks the fix.

**Current State:**
`home` command in `assets/terminal.js` uses a hardcoded string for its output.

**Affected Code (example context from `assets/terminal.js`):**
```javascript
    showHome() {
        const home = `
🏔️ Tasmania Off-Grid Home:

Location:     170 acres of Tasmanian bushland
Power:        Solar + Battery bank + Backup generator
Water:        Rainwater collection + Natural springs
Internet:     Starlink (when the weather cooperates)
Growing:      Food forest, market garden, livestock

Current Sensor Network:
• Solar panel monitoring via ESPHome
• Weather station with wind/rain/temp
• Soil moisture sensors in garden beds
• Battery bank telemetry
• Water tank level monitoring

Philosophy: Technology should enhance, not dominate, natural systems.
        `;
        this.addOutput(home, 'success');
    }
```

**Proposed Resolution:**
Modify `showHome` to dynamically load and display content from `content/homestead.md` using `this.markdownLoader.loadMarkdown('homestead')`.

**Labels:** `bug`, `semantic-drift`, `priority: medium`, `type: bug`