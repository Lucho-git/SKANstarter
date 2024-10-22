import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)

const MASTER_MAP_ID = 'f9265c5c-2333-4601-93e0-e30b54c3c919'

function convertTimestamp(milliseconds) {
  return new Date(parseInt(milliseconds)).toISOString()
}

async function processTrailData() {
  try {
    // Find the operation associated with this master_map_id
    const { data: operationData, error: operationError } = await supabase
      .from('operations')
      .select('*')
      .eq('master_map_id', MASTER_MAP_ID)
      .single()

    if (operationError) {
      throw new Error(`Error fetching operation: ${operationError.message}`)
    }

    if (!operationData) {
      throw new Error(`No operation found for master_map_id: ${MASTER_MAP_ID}`)
    }

    console.log(`Found operation for master_map_id: ${MASTER_MAP_ID}`)

    // Fetch all data points for the specified master_map_id
    const { data: trailData, error } = await supabase
      .from('trail_data')
      .select('*')
      .eq('master_map_id', MASTER_MAP_ID)
      .order('vehicle_id', { ascending: true })
      .order('timestamp', { ascending: true })

    if (error) {
      throw error
    }

    console.log(`Retrieved ${trailData.length} data points for master_map_id: ${MASTER_MAP_ID}`)

    // Log sample data points
    console.log('Sample data points:')
    console.log(JSON.stringify(trailData.slice(0, 5), null, 2))

    // Group the data points into trails
    const trails = groupIntoTrails(trailData)

    console.log(`Grouped data into ${trails.length} trails`)

    // Process each trail
    for (let index = 0; index < trails.length; index++) {
      const trail = trails[index]
      console.log(`\nProcessing Trail ${index + 1}:`)
      console.log(`Operation ID: ${operationData.id}`)
      console.log(`Vehicle ID: ${trail[0].vehicle_id}`)
      console.log(`Start Time: ${convertTimestamp(trail[0].timestamp)}`)
      console.log(`End Time: ${convertTimestamp(trail[trail.length - 1].timestamp)}`)
      console.log(`Color: ${trail[0].color}`)
      console.log(`Swath: ${trail[0].swath}`)
      console.log(`Number of points: ${trail.length}`)

      // Convert trail to PostGIS LineString
      const lineStringCoordinates = trail.map(point => {
        // Parse the point data type
        const match = point.coordinates.match(/\((.+),(.+)\)/)
        if (match) {
          const [, longitude, latitude] = match
          return `${longitude} ${latitude}`
        }
        return null
      }).filter(Boolean).join(',')

      const lineString = `SRID=4326;LINESTRING(${lineStringCoordinates})`
      console.log(`Generated LineString with ${trail.length} points: ${lineString ? 'Valid' : 'Invalid'}`)

      // Insert this trail into the database
      const { data, error } = await supabase
        .from('trails')
        .insert({
          operation_id: operationData.id,
          vehicle_id: trail[0].vehicle_id,
          start_time: convertTimestamp(trail[0].timestamp),
          end_time: convertTimestamp(trail[trail.length - 1].timestamp),
          trail_color: trail[0].color,
          trail_width: trail[0].swath,
          path: lineString
        })

      if (error) {
        console.error(`Error inserting trail ${index + 1}:`, error)
      } else {
        console.log(`Successfully inserted trail ${index + 1}`)
      }
    }

    console.log(`\nTotal trails processed: ${trails.length}`)

    // Log out the operation details
    console.log('\nOperation Details:')
    console.log(JSON.stringify(operationData, null, 2))

  } catch (error) {
    console.error('Error processing trail data:', error)
  }
}

function groupIntoTrails(dataPoints) {
  const trails = []
  let currentTrail = []
  let lastTimestamp = null
  let lastVehicleId = null

  for (const point of dataPoints) {
    if (lastVehicleId === null || 
        point.vehicle_id !== lastVehicleId || 
        (lastTimestamp && parseInt(point.timestamp) - parseInt(lastTimestamp) > 3 * 60 * 1000)) {
      if (currentTrail.length > 0) {
        trails.push(currentTrail)
      }
      currentTrail = [point]
    } else {
      currentTrail.push(point)
    }
    
    lastTimestamp = point.timestamp
    lastVehicleId = point.vehicle_id
  }

  if (currentTrail.length > 0) {
    trails.push(currentTrail)
  }

  return trails
}

processTrailData()
  .then(() => console.log('Finished processing trail data'))
  .catch(console.error)