import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { simplifyPath } from '../src/lib/utils/pathSimplification.js'

dotenv.config()

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)

const OPERATION_ID = '341c8237-07be-45fc-84b5-343fb723fbd6'

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

async function closeOperationTrails() {
    try {
        // Fetch all open trails for the operation, ordered by start time
        const { data: openTrails, error: trailError } = await supabase
            .from('trails')
            .select('*')
            .eq('operation_id', OPERATION_ID)
            .is('end_time', null)
            .order('start_time', { ascending: false })

        if (trailError) throw new Error(`Error fetching open trails: ${trailError.message}`)

        console.log(`Found ${openTrails?.length || 0} open trails for operation ${OPERATION_ID}`)
        
        if (!openTrails?.length) {
            console.log('No trails to process')
            return
        }

        // Group trails by vehicle_id
        const trailsByVehicle = {}
        openTrails.forEach(trail => {
            if (!trailsByVehicle[trail.vehicle_id]) {
                trailsByVehicle[trail.vehicle_id] = []
            }
            trailsByVehicle[trail.vehicle_id].push(trail)
        })

        // Process each vehicle's trails
        for (const [vehicleId, trails] of Object.entries(trailsByVehicle)) {
            console.log(`\nProcessing vehicle ${vehicleId}: ${trails.length} trails`)
            
            // Skip the most recent trail
            const trailsToClose = trails.slice(1)
            
            if (trailsToClose.length === 0) {
                console.log(`No trails to close for vehicle ${vehicleId}`)
                continue
            }

            for (const trail of trailsToClose) {
                try {
                    console.log(`\nClosing trail ${trail.id}:`)
                    
                    // Verify trail is still open
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

                    // Get trail points
                    const { data: trailPoints, error: pointsError } = await supabase
                        .from('trail_stream')
                        .select('*')
                        .eq('trail_id', trail.id)
                        .order('timestamp', { ascending: true })

                    if (pointsError) throw new Error(`Error fetching points: ${pointsError.message}`)
                    if (!trailPoints?.length) throw new Error('No points found')

                    // Filter valid points
                    const validPoints = trailPoints.filter(point => 
                        point.coordinate?.coordinates?.length === 2 &&
                        !isNaN(point.coordinate.coordinates[0]) && 
                        !isNaN(point.coordinate.coordinates[1])
                    )

                    if (validPoints.length < 2) {
                        console.log(`Trail ${trail.id} has insufficient valid points, skipping...`)
                        continue
                    }

                    const endTime = trailPoints[trailPoints.length - 1].timestamp

                    // Prepare paths for simplification
                    const pathForSimplification = validPoints
                        .map(point => ({
                            coordinates: `(${point.coordinate.coordinates[0]},${point.coordinate.coordinates[1]})`
                        }))

                    const simplifiedPath = simplifyPath(pathForSimplification, 0.000005)

                    if (!simplifiedPath?.length || simplifiedPath.length < 3) {
                        console.log(`Trail ${trail.id} has insufficient points after simplification, skipping...`)
                        continue
                    }

                    // Create detailed path
                    const detailedLineString = validPoints
                        .map(point => {
                            const [lng, lat] = point.coordinate.coordinates
                            return `${lng} ${lat} ${new Date(point.timestamp).getTime()}`
                        })
                        .join(',')
                    const detailedPath = `SRID=4326;LINESTRING M(${detailedLineString})`

                    await validateGeometry(detailedPath)

                    // Create simplified path
                    const simplifiedLineString = simplifiedPath
                        .map(point => {
                            const coords = point.coordinates.match(/\((.*?),(.*?)\)/)
                            if (!coords) throw new Error('Invalid coordinates in simplified path')
                            return `${coords[1]} ${coords[2]}`
                        })
                        .join(',')
                    const finalPath = `SRID=4326;LINESTRING(${simplifiedLineString})`

                    await validateGeometry(finalPath)

                    // Close the trail
                    const { data: result, error: updateError } = await supabase.rpc('close_trail', {
                        trail_id_param: trail.id,
                        end_time_param: endTime,
                        path_param: finalPath,
                        detailed_path_param: detailedPath
                    })

                    if (updateError) throw new Error(`Database update failed: ${updateError.message}`)
                    if (!result?.success) throw new Error(`Trail closure failed: ${JSON.stringify(result.errors || result.error)}`)

                    console.log(`Successfully closed trail ${trail.id}:`)
                    console.log(`- End time: ${endTime}`)
                    console.log(`- Original points: ${trailPoints.length}`)
                    console.log(`- Valid points: ${validPoints.length}`)
                    console.log(`- Simplified points: ${simplifiedPath.length}`)
                    console.log(`- Reduction: ${Math.round((1 - simplifiedPath.length / validPoints.length) * 100)}%`)

                } catch (trailError) {
                    console.error(`Error processing trail ${trail.id}:`, trailError)
                    continue
                }
            }
        }

        console.log('\nAll trails processed')

    } catch (error) {
        console.error('Fatal error processing trails:', error)
        process.exit(1)
    }
}

closeOperationTrails()
    .then(() => {
        console.log('\nScript completed successfully')
        process.exit(0)
    })
    .catch(error => {
        console.error('\nScript failed:', error)
        process.exit(1)
    })