import * as vscode from "vscode";

export type UpdateNotifications = "todosUpdated";

export const updateNotificationEmitter =
	new vscode.EventEmitter<UpdateNotifications>();

export function fireUpdate(type: UpdateNotifications) {
	updateNotificationEmitter.fire(type);
}
