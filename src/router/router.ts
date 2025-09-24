import { createRouter, procedure } from "../rpcHost";
import { showChanges } from "./showchanges";

export const router = createRouter({
    sample: procedure<any, { info: string }>(async () => {
        return { info: 'Sample data from extension' };
    }),
    showChanges: procedure<void, { info: string, diff: string }>(async (undefined, { context }) => {
        return showChanges(context);
    })
})