import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)

async function analyzeOpenTrails() {
    try {
        // Fetch all open trails
        const { data: openTrails, error: trailError } = await supabase
            .from('trails')
            .select('*')
            .is('end_time', null)

        if (trailError) {
            throw new Error(`Error fetching open trails: ${trailError.message}`)
        }

        console.log(`Found ${openTrails.length} open trails`)

        // Group trails by operation_id
        const trailsByOperation = {}

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

            // Create trail summary
            const trailSummary = {
                trail_id: trail.id,
                vehicle_id: trail.vehicle_id,
                start_time: trail.start_time,
                duration_hours: parseFloat(durationHours),
                point_count: trailPoints.length,
                path: trailPoints
            }

            // Group by operation_id
            if (!trailsByOperation[trail.operation_id]) {
                trailsByOperation[trail.operation_id] = []
            }
            trailsByOperation[trail.operation_id].push(trailSummary)
        }

        // Print summary
        console.log('\n=== Summary ===')
        console.log(`Total open trails: ${openTrails.length}`)
        console.log('\nBreakdown by operation:')
        
        for (const [operationId, trails] of Object.entries(trailsByOperation)) {
            console.log(`\nOperation ${operationId}:`)
            console.log(`- Number of open trails: ${trails.length}`)
            
            // Calculate total points for this operation
            const totalPoints = trails.reduce((sum, trail) => sum + trail.point_count, 0)
            console.log(`- Total trail points: ${totalPoints}`)

            // List individual trails
            trails.forEach(trail => {
                console.log(`\n  Trail ${trail.trail_id}:`)
                console.log(`  - Vehicle: ${trail.vehicle_id}`)
                console.log(`  - Duration: ${trail.duration_hours} hours`)
                console.log(`  - Points: ${trail.point_count}`)
            })
        }

    } catch (error) {
        console.error('Error analyzing trails:', error)
    }
}

analyzeOpenTrails()
    .then(() => console.log('\nAnalysis complete'))
    .catch(console.error)