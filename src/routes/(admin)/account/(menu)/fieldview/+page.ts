// src/routes/admin/fieldview/+page.ts
import type { PageLoad } from './$types'
import { userFilesStore } from '../../../../../stores/userFilesStore'

export const load: PageLoad = async ({ data }) => {
    const { files } = data

    // Update the store with the fetched files
    userFilesStore.set(files)
    console.log('FILE DATA', data)
    return data
}