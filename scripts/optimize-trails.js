import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { simplifyPath } from '../src/lib/utils/pathSimplification'

dotenv.config()

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)

const OPERATION_ID = 'your-operation-id-here' // Replace with your operation ID

async function optimizeTrails() {
    try {
        // Fetch all trails for the specified operation_id
        const { data: trails, error: fetchError } = await supabase
            .from('trails')
            .select('*')
            .eq('operation_id', OPERATION_ID)

        if (fetchError) {
            throw new Error(`Error fetching trails: ${fetchError.message}`)
        }

        console.log(`Found ${trails.length} trails to process`)

        for (const trail of trails) {
            console.log(`\nProcessing trail ${trail.id}:`)

            // Extract coordinates from detailed_path
            const detailedPathMatch = trail.detailed_path?.match(/LINESTRING M\((.*)\)/)
            if (!detailedPathMatch) {
                console.log(`No detailed path found for trail ${trail.id}, skipping...`)
                continue
            }

            // Parse the coordinates
            const coordinates = detailedPathMatch[1].split(',').map(point => {
                const [lon, lat, timestamp] = point.trim().split(' ')
                return {
                    coordinates: `(${lon},${lat})`
                }
            })

            console.log(`Original coordinates count: ${coordinates.length}`)

            // Apply simplification
            const simplifiedPath = simplifyPath(coordinates, 0.0001)
            console.log(`Simplified coordinates count: ${simplifiedPath.length}`)
            console.log(`Reduction: ${Math.round((1 - simplifiedPath.length / coordinates.length) * 100)}%`)

            // Convert simplified path back to LineString
            const simplifiedLineString = simplifiedPath.map((point: any) => {
                const coords = point.coordinates.match(/\((.*?),(.*?)\)/)
                return `${coords[1]} ${coords[2]}`
            }).join(',')

            const newPath = `SRID=4326;LINESTRING(${simplifiedLineString})`

            // Update the trail with the simplified path
            const { error: updateError } = await supabase
                .from('trails')
                .update({
                    path: newPath
                })
                .eq('id', trail.id)

            if (updateError) {
                console.error(`Error updating trail ${trail.id}:`, updateError)
            } else {
                console.log(`Successfully updated trail ${trail.id}`)
            }
        }

        console.log('\nFinished processing all trails')

    } catch (error) {
        console.error('Error processing trails:', error)
    }
}

optimizeTrails()
    .then(() => console.log('Script completed'))
    .catch(console.error)