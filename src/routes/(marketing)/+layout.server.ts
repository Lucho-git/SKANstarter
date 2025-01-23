// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { getSession }, url }) => {
    const session = await getSession();
    return {
        session,
        url: url.origin
    };
};