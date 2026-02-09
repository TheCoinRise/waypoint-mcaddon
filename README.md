# Waypoint Addon

A Minecraft Bedrock Addon that adds a personal Waypoint Device.

## Features
- **Waypoint Device**: Use this item to open the menu.
- **Save Locations**: Name and save your current coordinates.
- **Teleport**: Instantly travel to any saved waypoint.
- **Manage**: Delete old waypoints.
- **Persistent Storage**: Waypoints are saved to your player data.

## Installation
1. Ensure you have Node.js installed.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to compile the TypeScript.
4. Copy the `BP` and `RP` folders to your Minecraft `development_behavior_packs` and `development_resource_packs` folders respectively.
   - Windows Path: `%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\`

## Crafting Recipe

Craft the Waypoint Device at a crafting table:

```
[Cobblestone] [Dirt]   [Cobblestone]
[Dirt]        [Stick]  [Dirt]
[Cobblestone] [Dirt]   [Cobblestone]
```

## Texture
Place a texture file named `waypoint_device.png` in `RP/textures/items/`.
