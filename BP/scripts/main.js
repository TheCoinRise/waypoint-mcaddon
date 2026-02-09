import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
const STORAGE_KEY = "factory:waypoints";
function getWaypoints(player) {
    const data = player.getDynamicProperty(STORAGE_KEY);
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            console.warn("Failed to parse waypoints", e);
            return [];
        }
    }
    return [];
}
function saveWaypoints(player, waypoints) {
    player.setDynamicProperty(STORAGE_KEY, JSON.stringify(waypoints));
}
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
async function showMainMenu(player) {
    const form = new ActionFormData()
        .title("Waypoint Device")
        .body("Select an action:")
        .button("Teleport to Waypoint", "textures/ui/portal")
        .button("Set New Waypoint", "textures/ui/color_plus")
        .button("Manage Waypoints", "textures/ui/pencil");
    const response = await form.show(player);
    if (response.canceled)
        return;
    switch (response.selection) {
        case 0:
            showTeleportMenu(player);
            break;
        case 1:
            showCreateMenu(player);
            break;
        case 2:
            showManageMenu(player);
            break;
    }
}
async function showCreateMenu(player) {
    const modal = new ModalFormData()
        .title("New Waypoint")
        .textField("Waypoint Name", "e.g., Home Base");
    const response = await modal.show(player);
    if (response.canceled)
        return;
    const name = response.formValues?.[0];
    if (!name || name.trim().length === 0) {
        player.sendMessage("§cInvalid name. Waypoint not saved.");
        return;
    }
    const location = player.location;
    const dimension = player.dimension.id;
    const newWaypoint = {
        id: generateId(),
        name: name.trim(),
        x: Math.floor(location.x),
        y: Math.floor(location.y),
        z: Math.floor(location.z),
        dimension: dimension,
        created: Date.now()
    };
    const waypoints = getWaypoints(player);
    waypoints.push(newWaypoint);
    saveWaypoints(player, waypoints);
    player.sendMessage(`§aWaypoint '${name}' saved at ${newWaypoint.x}, ${newWaypoint.y}, ${newWaypoint.z}.`);
}
async function showTeleportMenu(player) {
    const waypoints = getWaypoints(player);
    if (waypoints.length === 0) {
        player.sendMessage("§eNo waypoints saved.");
        return;
    }
    const form = new ActionFormData()
        .title("Teleport")
        .body("Choose a destination:");
    waypoints.forEach(wp => {
        form.button(`${wp.name}\n${wp.dimension} (${wp.x}, ${wp.y}, ${wp.z})`);
    });
    const response = await form.show(player);
    if (response.canceled || response.selection === undefined)
        return;
    const target = waypoints[response.selection];
    // Teleport logic
    // We need to check if dimensions match or handle dimension change (Script API handles it if coords are right usually, but safer to use teleport command or method)
    try {
        const targetDim = world.getDimension(target.dimension);
        if (!targetDim) {
            player.sendMessage(`§cError: Dimension '${target.dimension}' not found.`);
            return;
        }
        // Use player.teleport
        player.teleport({ x: target.x, y: target.y, z: target.z }, {
            dimension: targetDim
        });
        player.sendMessage(`§bTeleported to ${target.name}.`);
    }
    catch (e) {
        player.sendMessage(`§cTeleport failed: ${e}`);
    }
}
async function showManageMenu(player) {
    const waypoints = getWaypoints(player);
    if (waypoints.length === 0) {
        player.sendMessage("§eNo waypoints to manage.");
        return;
    }
    const form = new ActionFormData()
        .title("Delete Waypoints")
        .body("Select waypoints to DELETE:");
    waypoints.forEach(wp => {
        form.button(`DELETE: ${wp.name}`, "textures/ui/cancel");
    });
    const response = await form.show(player);
    if (response.canceled || response.selection === undefined)
        return;
    const toDelete = waypoints[response.selection];
    // Confirm delete
    const confirm = new ModalFormData()
        .title("Confirm Delete")
        .toggle(`Are you sure you want to delete '${toDelete.name}'?`, false);
    const confirmRes = await confirm.show(player);
    if (confirmRes.canceled || !confirmRes.formValues?.[0]) {
        return; // Cancelled
    }
    const newWaypoints = waypoints.filter(wp => wp.id !== toDelete.id);
    saveWaypoints(player, newWaypoints);
    player.sendMessage(`§eWaypoint '${toDelete.name}' deleted.`);
}
// Event Listener
world.beforeEvents.itemUse.subscribe((event) => {
    if (event.itemStack.typeId === "factory:waypoint_device") {
        const player = event.source;
        // Run on next tick to avoid blocking the event or UI issues
        system.run(() => {
            showMainMenu(player);
        });
    }
});
