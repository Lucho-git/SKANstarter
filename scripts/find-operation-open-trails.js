import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)

const OPERATION_ID = '341c8237-07be-45fc-84b5-343fb723fbd6'

async function analyzeOperationTrails() {
    try {
        // Fetch all open trails for the specific operation
        const { data: openTrails, error: trailError } = await supabase
            .from('trails')
            .select('*')
            .eq('operation_id', OPERATION_ID)
            .is('end_time', null)
            .order('start_time', { ascending: false })

        if (trailError) {
            throw new Error(`Error fetching open trails: ${trailError.message}`)
        }

        console.log(`\n=== Analysis for Operation ${OPERATION_ID} ===`)
        console.log(`Found ${openTrails.length} open trails\n`)

        // Group trails by vehicle_id
        const trailsByVehicle = {}

        for (const trail of openTrails) {
            // Get trail points
            const { data: trailPoints, error: pointsError } = await supabase
                .from('trail_stream')
                .select('*')
                .eq('trail_id', trail.id)
                .order('timestamp', { ascending: true })

            if (pointsError) {
                console.error(`Error fetching points for trail ${trail.id}:`, pointsError)
                continue
            }

            // Calculate duration
            const startTime = new Date(trail.start_time)
            const duration = Date.now() - startTime.getTime()
            const durationHours = (duration / (1000 * 60 * 60)).toFixed(2)

            // Format the start time
            const formattedStartTime = new Date(trail.start_time).toLocaleString()

            // Create trail summary
            const trailSummary = {
                trail_id: trail.id,
                start_time: formattedStartTime,
                duration_hours: parseFloat(durationHours),
                point_count: trailPoints.length,
                path: trailPoints,
                first_point: trailPoints[0]?.timestamp ? new Date(trailPoints[0].timestamp).toLocaleString() : 'N/A',
                last_point: trailPoints[trailPoints.length - 1]?.timestamp 
                    ? new Date(trailPoints[trailPoints.length - 1].timestamp).toLocaleString() 
                    : 'N/A'
            }

            // Group by vehicle_id
            if (!trailsByVehicle[trail.vehicle_id]) {
                trailsByVehicle[trail.vehicle_id] = []
            }
            trailsByVehicle[trail.vehicle_id].push(trailSummary)
        }

        // Print summary
        console.log('Breakdown by vehicle:')
        
        for (const [vehicleId, trails] of Object.entries(trailsByVehicle)) {
            console.log(`\nVehicle ${vehicleId}:`)
            console.log(`- Number of open trails: ${trails.length}`)
            
            // Calculate total points for this vehicle
            const totalPoints = trails.reduce((sum, trail) => sum + trail.point_count, 0)
            console.log(`- Total trail points: ${totalPoints}`)

            // List individual trails (sorted by start time, most recent first)
            trails.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
            trails.forEach((trail, index) => {
                console.log(`\n  Trail ${index + 1}: ${trail.trail_id}`)
                console.log(`  - Start time: ${trail.start_time}`)
                console.log(`  - Duration: ${trail.duration_hours} hours`)
                console.log(`  - Points: ${trail.point_count}`)
                console.log(`  - First point: ${trail.first_point}`)
                console.log(`  - Last point: ${trail.last_point}`)
            })
        }

        // Print actionable summary
        console.log('\n=== Actionable Summary ===')
        for (const [vehicleId, trails] of Object.entries(trailsByVehicle)) {
            if (trails.length > 1) {
                console.log(`\nVehicle ${vehicleId} has ${trails.length} open trails:`)
                console.log('Recommended action: Close or merge older trails')
                trails.forEach((trail, index) => {
                    console.log(`- Trail ${trail.trail_id}: ${trail.point_count} points, started ${trail.start_time}`)
                })
            }
        }

    } catch (error) {
        console.error('Error analyzing trails:', error)
    }
}

analyzeOperationTrails()
    .then(() => console.log('\nAnalysis complete'))
    .catch(console.error)