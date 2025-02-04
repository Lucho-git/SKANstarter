// routes/logout/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { getSession } }) => {
    const session = await getSession();

    return {
        session
    };
};