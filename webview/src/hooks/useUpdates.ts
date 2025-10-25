import { useEffect } from "react";
import type { UpdateNotifications } from "../../../src/helpers/updateNotification";

export function useUpdates(
	refreshFunction: () => unknown,
	messageType: UpdateNotifications,
) {
	useEffect(() => {
		const handler = (e: MessageEvent) => {
			try {
				const msg = e.data;
				if (msg && msg.type === messageType) {
					void refreshFunction();
				}
			} catch {
				// ignore
			}
		};

		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [refreshFunction, messageType]);
}
