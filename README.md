## [Live site](https://thomasevans.org/)  (desktop recommended)

## Why this project?

I needed an interesting, first project to make in React, and the first thing that came to mind (when I was having a shower of course) was a tower defense game set in a spreadsheet. I found this interesting because I would need to learn how to make both a spreadsheet and a game engine and I have never seen that done before.

## About this project

At this stage, I wouldn't call it a game as there isn't really any gameplay; this is a game engine and it is in a state that I am _reasonably_ happy with. 

![page](/docs/images/page.png)

In retrospect, I would *not* make something like this in React again; React just isn't designed for that many DOM re-renders per second, but I am glad I did. This project has been an incredible learning experience as for the first time, I have had to strongly consider the performance impact of my code (there were times where my gaming laptop struggled to run this). I have refactored this code for optimisation more times than I can count, and it can now run at a significantly faster and larger scale than when it was just based in the console.

## How to control

I know I need to add a tutorial, but for the meantime here you go:

To spawn an entity, you simply need to input an entity name followed by a level number and hit enter or tab. 

For example:

To spawn a level one wall, you would input: wall1. 

To spawn a level three bow, you would input: bow3.

A full list of spawnable entities can be found in the entities tab.

You can only spawn entities in unoccupied spaces.

## Features:

### Randomly generated waves

Enemies (or friendlies depending on gamemode) spawned during a wave are randomly chosen based on a chance value, meaning stronger entities are less likely to spawn over weaker entities.

### Randomly generated terrain

Every time the map gets reloaded, the terrain is randomly generated (with weighting depending on gamemode) and can be damaged and destroyed by entities and projectiles, making every round feel unique and dynamic.

### Water physics

Water that can either be generated with the terrain or by entities behaves like water should, flowing downstream if possible.

### Spreadsheet simulation

Not only does the game look like a spreadsheet, it feels like one. All gameplay is done in a manner that could be done in a spreadsheet.

### Conditionally rendered gameboard

Given how large spreadsheets can get, I started running into performance issues re-rendering that many DOM elements X amount of times per second. To improve performace, the DOM only renders what you see, and emulates cells off-screen. This made my maximum column count go from around 80 without performance impact to something so high (I tested 8000) I don't even know what the limit is.

### Lots of game settings

There are currently 13 customisable game settings that range from how many pixels-wide cells are, to how much water spawns when generated.

### Multiple gamemodes

There are 6 gamemodes at the moment, allowing for different gameplay loop behaviour:
- King - your king spawns on a hill to the left, while enemies spawn on the right. If the king dies, you lose.
- Battle - two automatically spawning sides face each other.
- Blob - a giant amorphous blob spawns at the right, if it makes it to the left, you lose.
- Blob fight - two giant amorphous blobs fight each other.
- Blob gob - regular entities spawn from the left, fighting a blob from the right.

### Multiple entity types

There are currently 16 entities, with more easily added. Here are a few of the more interesting ones:

- Blob - a special entity that slowly grows and takes over the entire map if not kept in check. While it may look like one entity, every cell that it comprises of is an individual entity that talks to the rest of the blob.
- Mage - shoots a projectile vertically that seeks out the nearest enemy.
- Spider - like a regular entity, except it scales walls instead of destroying them.
- Dropper - drops a barrel that rolls downwards, then explodes when it hits either a wall or entity.
## Features to be added

- Tutorial
- Wave progression
- Shop
- More entity types
- More spreadsheet controls (ctrl, shift, copy, paste etc.)
- Allowing user to add conditional statements to entities

## Known issues

- Scrolling only works correctly with a trackpad. This is because the conditional rendering is based on scrolling, and I didn't account for other scroll types interacting with this differently. Unfortunately this means the mobile version is basically unusable (not that it was designed for mobile), and mouse use is frustrating.
- Typing issues. Due to how React is re-rendering the cells X amount of times per second, I have had to recreate typing logic in the cell selected, else it would prevent you from typing. Unfortunately I have not account for all possible typing logic yet, so there are various issues on input.
- If spawning new rounds too fast, entity and ground spawning can be incorrect. This could be fixed with a button delay.

### Built using:

- [React](https://react.dev/)
