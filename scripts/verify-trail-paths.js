import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import wkx from 'wkx'

dotenv.config()

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)

// const TRAIL_ID = '92ce547d-1c4d-4ca4-b718-0eae6bbd0ceb'
const TRAIL_ID = "22a6fee5-cdde-4c7c-b0a0-6aad165f0fb7"



async function verifyTrailPaths() {
    try {
        // Fetch single trail
        const { data: trails, error: trailError } = await supabase
            .from('trails')
            .select(`
                id,
                vehicle_id,
                operation_id,
                start_time,
                end_time,
                trail_color,
                trail_width,
                path,
                detailed_path
            `)
            .eq('id', TRAIL_ID)
            .single()

        if (trailError) throw new Error(`Error fetching trail: ${trailError.message}`)
        
        const trail = trails

        console.log(`\nVerifying trail ${trail.id}:`)
        console.log(`Vehicle: ${trail.vehicle_id}`)
        console.log(`Start: ${trail.start_time}`)
        console.log(`End: ${trail.end_time}`)

        // Parse path GeoJSON
        let pathGeoJSON = null
        try {
            if (typeof trail.path === 'string') {
                const geometry = wkx.Geometry.parse(Buffer.from(trail.path, 'hex'))
                pathGeoJSON = geometry.toGeoJSON()
            } else if (typeof trail.path === 'object') {
                pathGeoJSON = trail.path
            }
        } catch (e) {
            console.error('Error parsing path:', e)
        }

        // Parse detailed path
        let detailedCoordinates = []
        if (trail.detailed_path) {
            try {
                const geometry = wkx.Geometry.parse(Buffer.from(trail.detailed_path, 'hex'))
                const geoJSON = geometry.toGeoJSON()
                
                // Extract coordinates and M value (timestamp) from LineString M
                detailedCoordinates = geometry.points.map(point => ({
                    coordinates: [point.x, point.y],
                    timestamp: point.m ? new Date(point.m) : null
                }))
                
            } catch (e) {
                console.error('Error parsing detailed path:', e)
                console.log('Raw detailed path:', trail.detailed_path)
            }
        }

        // Get original points
        const { data: originalPoints, error: pointsError } = await supabase
            .from('trail_stream')
            .select('coordinate, timestamp')
            .eq('trail_id', trail.id)
            .order('timestamp', { ascending: true })

        if (pointsError) {
            console.error(`Error fetching original points: ${pointsError.message}`)
            return
        }

        // Print counts
        console.log('\nPoint Counts:')
        console.log(`Original stream points: ${originalPoints?.length || 0}`)
        console.log(`Detailed path points: ${detailedCoordinates.length}`)
        console.log(`Simplified path points: ${pathGeoJSON?.coordinates?.length || 0}`)

        // Sample points
        if (originalPoints?.length) {
            console.log('\nOriginal Points Sample:')
            console.log('First:', {
                coordinates: originalPoints[0].coordinate,
                timestamp: originalPoints[0].timestamp
            })
            console.log('Last:', {
                coordinates: originalPoints[originalPoints.length - 1].coordinate,
                timestamp: originalPoints[originalPoints.length - 1].timestamp
            })
        }

        if (detailedCoordinates.length) {
            console.log('\nDetailed Path Sample:')
            console.log('First:', {
                coordinates: detailedCoordinates[0].coordinates,
                timestamp: detailedCoordinates[0].timestamp
            })
            console.log('Last:', {
                coordinates: detailedCoordinates[detailedCoordinates.length - 1].coordinates,
                timestamp: detailedCoordinates[detailedCoordinates.length - 1].timestamp
            })
        }

        if (pathGeoJSON?.coordinates?.length) {
            console.log('\nSimplified Path Sample:')
            console.log('First:', pathGeoJSON.coordinates[0])
            console.log('Last:', pathGeoJSON.coordinates[pathGeoJSON.coordinates.length - 1])
        }

    } catch (error) {
        console.error('Error verifying trail paths:', error)
        throw error
    }
}

verifyTrailPaths()
    .then(() => {
        console.log('\nVerification completed successfully')
        process.exit(0)
    })
    .catch(error => {
        console.error('\nVerification failed:', error)
        process.exit(1)
    })