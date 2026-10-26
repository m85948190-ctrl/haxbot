# HacksBot AI — Phase 1

A standalone prototype for the **AI Configuration System**. HacksBot is kept separate from the existing HAxBRO repositories.

## Phase 1 scope

- Define a bot's goal, role, instructions, restrictions, context to preserve, and success criteria.
- Arrange a workflow plan and review it before execution.
- Preview and validate the configuration as JSON.
- Save configurations in this browser or export/import JSON files.
- No automation runs in Phase 1. Tool execution belongs to Phase 2 and must obey the approved configuration.

## Run locally

Open `index.html` in a modern browser. No build step or API key is required.

## Data and safety

Configurations are stored in this browser's `localStorage` only. They are not uploaded to a server. Do not place secrets or passwords in configuration fields. The workflow preview is a plan, not evidence that actions have been executed.

## Roadmap

1. **AI Configuration System** — this prototype.
2. Automation System — separate execution layer that checks permissions, executes approved steps, records real outcomes, and reports failures.
3. Prototype tests and deployment preparation.
4. Heroku hosting after the prototype is reviewed.
