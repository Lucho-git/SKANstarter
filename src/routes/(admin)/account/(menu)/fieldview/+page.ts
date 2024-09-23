// src/routes/admin/fieldview/+page.ts
import type { PageLoad } from './$types'
import { userFilesStore } from '../../../../../stores/userFilesStore'
import { fieldStore } from '../../../../../stores/fieldStore'

export const load: PageLoad = async ({ data }) => {
    const { files, fields } = data

    // Update the userFilesStore with the fetched files
    userFilesStore.set(files)
    console.log('FILE DATA', files)

    // Update the fieldStore with the fetched fields
    fieldStore.set(fields)
    console.log('FIELD DATA', fields)

    // Return an empty object since we're using stores
    return {}
}