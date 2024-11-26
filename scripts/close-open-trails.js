import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { simplifyPath } from '../src/lib/utils/pathSimplification.js'

dotenv.config()

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)

async function validateGeometry(path) {
    try {
        if (!path.startsWith('SRID=4326;LINESTRING')) {
            throw new Error('Invalid geometry format')
        }
        if (path.length < 30) {
            throw new Error('Path too short to be valid')
        }
        return true
    } catch (error) {
        throw new Error(`Geometry validation failed: ${error.message}`)
    }
}

async function deleteTrailAndPoints(trailId) {
    // Delete points first due to foreign key constraint
    const { error: pointsDeleteError } = await supabase
        .from('trail_stream')
        .delete()
        .eq('trail_id', trailId)

    if (pointsDeleteError) throw new Error(`Error deleting points: ${pointsDeleteError.message}`)

    // Then delete the trail
    const { error: trailDeleteError } = await supabase
        .from('trails')
        .delete()
        .eq('id', trailId)

    if (trailDeleteError) throw new Error(`Error deleting trail: ${trailDeleteError.message}`)

    console.log(`Deleted trail ${trailId} and its points due to insufficient points after simplification`)
}

async function processOldOpenTrails() {
    try {
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

        const { data: oldTrails, error: trailError } = await supabase
            .from('trails')
            .select('*')
            .is('end_time', null)
            .lt('start_time', fortyEightHoursAgo)
            .limit(5)

        if (trailError) throw new Error(`Error fetching old trails: ${trailError.message}`)

        console.log(`Found ${oldTrails?.length || 0} trails open longer than 48 hours (limited to 5)`)
        
        if (!oldTrails?.length) {
            console.log('No trails to process')
            return
        }

        for (const trail of oldTrails) {
            try {
                console.log(`\nProcessing trail ${trail.id}:`)
                
                const { data: currentTrail, error: verifyError } = await supabase
                    .from('trails')
                    .select('id, end_time')
                    .eq('id', trail.id)
                    .single()

                if (verifyError) throw new Error(`Error verifying trail: ${verifyError.message}`)
                if (!currentTrail) throw new Error('Trail no longer exists')
                if (currentTrail.end_time) {
                    console.log('Trail already closed, skipping...')
                    continue
                }

                const { data: trailPoints, error: pointsError } = await supabase
                    .from('trail_stream')
                    .select('*')
                    .eq('trail_id', trail.id)
                    .order('timestamp', { ascending: true })

                if (pointsError) throw new Error(`Error fetching points: ${pointsError.message}`)
                if (!trailPoints?.length) throw new Error('No points found')

                const validPoints = trailPoints.filter(point => 
                    point.coordinate?.coordinates?.length === 2 &&
                    !isNaN(point.coordinate.coordinates[0]) && 
                    !isNaN(point.coordinate.coordinates[1])
                )

                if (validPoints.length < 2) {
                    await deleteTrailAndPoints(trail.id)
                    continue
                }

                const endTime = trailPoints[trailPoints.length - 1].timestamp

                const pathForSimplification = validPoints
                    .map(point => ({
                        coordinates: `(${point.coordinate.coordinates[0]},${point.coordinate.coordinates[1]})`
                    }))

                const simplifiedPath = simplifyPath(pathForSimplification, 0.000005)

                // Check if simplified path has fewer than 3 points
                if (!simplifiedPath?.length || simplifiedPath.length < 3) {
                    await deleteTrailAndPoints(trail.id)
                    continue
                }

                const detailedLineString = validPoints
                    .map(point => {
                        const [lng, lat] = point.coordinate.coordinates
                        return `${lng} ${lat} ${new Date(point.timestamp).getTime()}`
                    })
                    .join(',')
                const detailedPath = `SRID=4326;LINESTRING M(${detailedLineString})`

                await validateGeometry(detailedPath)

                const simplifiedLineString = simplifiedPath
                    .map(point => {
                        const coords = point.coordinates.match(/\((.*?),(.*?)\)/)
                        if (!coords) throw new Error('Invalid coordinates in simplified path')
                        return `${coords[1]} ${coords[2]}`
                    })
                    .join(',')
                const finalPath = `SRID=4326;LINESTRING(${simplifiedLineString})`

                await validateGeometry(finalPath)

                const { data: result, error: updateError } = await supabase.rpc('close_trail', {
                    trail_id_param: trail.id,
                    end_time_param: endTime,
                    path_param: finalPath,
                    detailed_path_param: detailedPath
                })

                if (updateError) throw new Error(`Database update failed: ${updateError.message}`)
                if (!result?.success) throw new Error(`Trail closure failed: ${JSON.stringify(result.errors || result.error)}`)

                console.log(`Successfully processed trail ${trail.id}:`)
                console.log(`- End time set to: ${endTime}`)
                console.log(`- Original points: ${trailPoints.length}`)
                console.log(`- Valid points: ${validPoints.length}`)
                console.log(`- Simplified points: ${simplifiedPath.length}`)
                console.log(`- Reduction: ${Math.round((1 - simplifiedPath.length / validPoints.length) * 100)}%`)

            } catch (trailError) {
                console.error(`Error processing trail ${trail.id}:`, trailError)
                continue
            }
        }

        console.log('\nAll trails processed')

    } catch (error) {
        console.error('Fatal error processing trails:', error)
        process.exit(1)
    }
}

processOldOpenTrails()
    .then(() => {
        console.log('\nScript completed successfully')
        process.exit(0)
    })
    .catch(error => {
        console.error('\nScript failed:', error)
        process.exit(1)
    })