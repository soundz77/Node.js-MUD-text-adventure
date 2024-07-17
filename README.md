# The beginnings of a Multi User Dungeon\*

*(A multiplayer, text-based adventure game).

## Setup

Start by renaming example.env to .env. Add a port, environment and a session secret. Npm install the required packages, and start with npm start (or npm run dev), which runs src/app.js.

The game currently includes very basic location descriptions, a number of monster types and artifacts.
Change settings in src/game/gameData/game1.js to add/improve room descriptions, monsters and artifacts. The chance of a monster having an artifact (which it drops when killed) and the chances of artifacts being placed in a particular location can also be set in gameData.

## Gameplay

Players can attack monsters (which retaliate and may flee the location) and pick up/drop/examine artifacts. Some artifacts can be equipped or used, and some can be eaten. Doing so changes a player's stats. Players gain XP by killing monsters and eventually level-up by doing so (this also increases their stats).

## UI

Players stats are visible in the left side-bar. The location description is in the centre, and a basic chat box is provided in the right side-bar.

Uses node.js and socket.io.
