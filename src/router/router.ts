import z from "zod";
import { createRouter, procedure } from "../rpcHost";
import { showChanges } from "./showchanges";

export const router = createRouter({
    showChanges: procedure(
        z.void(),
        async (_input, { context }) => {
        return showChanges(context);
    })
})

export type AppRouter = typeof router;