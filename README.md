# The beginnings of a Multi User Dungeon\*

\*(A multiplayer, text-based adventure game).

## Setup

Start by renaming example.env to .env. Add a port, environment and a session secret. Npm install the required packages, and start with npm start (or npm run dev), which runs src/app.js.

The game currently includes very basic location descriptions, a number of monster types and artifacts.
Change settings in src/game/gameData/gameData.js to add/improve room descriptions, monsters and artifacts. The chance of a monster having an artifact (which it drops when killed) and the chances of artifacts being placed in a particular location can also be set in gameData.

## Gameplay

Players can attack monsters (which retaliate and may flee the location) and pick up/drop/examine artifacts. Some artifacts can be equipped or used, and some can be eaten. Doing so changes a player's stats. Players gain XP by killing monsters and eventually level-up by doing so (this also increases their stats).

## UI

Players stats are visible in the left side-bar. The location description is in the centre, and a basic chat box is provided in the right side-bar.

Uses node.js and socket.io.

Bugs

At startup

New player arrives in first room. Room details are not displayed as now need to use sockets instead of calling functions directly.

error: unhandledRejection: Unable to start game: Failed to start the game. Error: Failed to set up the game. Error: Error populating locations. Error: Error adding creature to location. TypeError: Cannot read properties of undefined (reading 'addCreature')
Error: Unable to start game: Failed to start the game. Error: Failed to set up the game. Error: Error populating locations. Error: Error adding creature to location. TypeError: Cannot read properties of undefined (reading 'addCreature')
at startGame startGame.js:20:11)
at async onImport.tracePromise.**proto** (node:internal/modules/esm/loader:547:26)
at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:116:5)
[nodemon] app crashed - waiting for file changes before starting...

On Spawn/Tick
Some creatures are spawned as artifacts. So "An item shimmers into view:" ... but it's an Orc etc.
