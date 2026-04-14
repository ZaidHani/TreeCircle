# TreeCircle (Pie Charts Tree) - Fork

This repository contains a **fork** of the original TreeCircle Power BI custom visual by Aritz Francoy Barreiro.

The visual renders a hierarchical tree where each node can display a pie/progress style indicator to compare actual value, target, and progress.

## Fork Notice and Attribution

- Original project: [aritzfb/TreeCircle](https://github.com/aritzfb/TreeCircle)
- Original author: Aritz Francoy Barreiro
- This repository is a fork/customized copy and may include local changes for your own environment and use cases.

If you redistribute this visual, keep the original attribution and review licensing terms.

## What This Visual Does

The visual supports hierarchical category drill-down with up to 7 category levels and optional measures:

- `Categories` (Grouping): tree hierarchy
- `Value` (Measure): actual value for node sizing/labeling
- `Target` (Measure): target reference
- `Progress` (Measure): completion ratio (typically 0 to 1)

Common usage modes:

1. Category-only tree
2. Tree + values
3. Tree + value vs target
4. Tree + progress/compliance view

## Main Customization Areas

- `capabilities.json`: data roles, formatting pane objects, and data mappings
- `src/visual.ts`: visual lifecycle, rendering trigger, tree initialization
- `src/settings.ts`: default formatting settings and option classes
- `style/visual.less`: visual CSS/LESS styling
- `pbiviz.json`: visual metadata (name, GUID, version, API version)

## Prerequisites

- Node.js LTS (recommended: Node 16 or 18 for older Power BI visuals tooling compatibility)
- npm
- Power BI Desktop

## Setup and Build

From the repository root:

```bash
npm install
```

Run in development mode (hot reload for visual sandbox):

```bash
npx pbiviz start
```

Create a distributable `.pbiviz` package:

```bash
npx pbiviz package
```

After packaging, the visual file is generated in:

- `.tmp/drop/*.pbiviz` (output location depends on tooling version)

## How to Create the Power BI Visual from This Code

Use this flow when you want to generate and use the custom visual in Power BI Desktop:

1. Install dependencies with `npm install`.
2. Build/package using `npx pbiviz package`.
3. Open Power BI Desktop.
4. In the Visualizations pane, click the three dots (`...`) and select **Get more visuals**.
5. Choose **Import a visual from a file**.
6. Select the generated `.pbiviz` file from this project output folder.
7. Add the imported visual to your report canvas.
8. Bind fields:
   - Put hierarchy fields in `Categories`
   - Put numeric measure in `Value`
   - Optionally add `Target` and `Progress`
9. Configure formatting options in the format pane (`Tree Options`, `Tree Labels`, `Tree Colors`, `Legend`).

## How to Develop and Test Iteratively

If you are actively modifying code:

1. Run `npx pbiviz start`.
2. Open [https://app.powerbi.com](https://app.powerbi.com) and load a report in developer visual mode (or use Power BI Desktop test workflow if preferred).
3. Update files under `src/` and `style/`.
4. Re-package with `npx pbiviz package` when you need to import a final `.pbiviz` into Desktop.

## Notes for This Fork

- The repository currently contains generated/transient files under `.tmp/` and many local modifications in `node_modules/`.
- For clean source control, avoid committing `node_modules/` and build artifacts.
- Consider setting a new visual GUID in `pbiviz.json` before distributing your own version, so it can coexist with other builds.

## Contributors

- Aritz Francoy Barreiro (original author)
- Sergio Alvaro Panizo
- Eduardo Valladolid
- Mohammed Suhel
- Fork maintainer(s): this repository owner

## License

See the visual EULA used by the original project:

- [Power BI - Default Custom Visual EULA (PDF)](https://visuals.azureedge.net/app-store/Power%20BI%20-%20Default%20Custom%20Visual%20EULA.pdf)
