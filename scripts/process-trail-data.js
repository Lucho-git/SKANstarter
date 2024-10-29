import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { simplifyPath } from '../src/lib/utils/pathSimplification.js'

dotenv.config()

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)

// Comment/uncomment these lines to switch between single map and all maps
const PROCESS_ALL_MAPS = false
const SINGLE_MAP_ID = '489f8e7c-111b-4a57-ac1e-5b73df4a5167'

function convertTimestamp(milliseconds) {
  return new Date(parseInt(milliseconds)).toISOString()
}

async function getAllMasterMapIds() {
  const { data, error } = await supabase
    .from('master_maps')
    .select('id')

  if (error) throw error
  return data.map(map => map.id)
}

async function processTrailData(masterMapId) {
  try {
    console.log(`\n=== Processing master_map_id: ${masterMapId} ===`)

    // Find the operations associated with this master_map_id
    const { data: operationsData, error: operationError } = await supabase
      .from('operations')
      .select('*')
      .eq('master_map_id', masterMapId)
      .order('created_at', { ascending: true })

    if (operationError) {
      console.error(`Error fetching operations for ${masterMapId}: ${operationError.message}`)
      return
    }

    if (!operationsData || operationsData.length === 0) {
      console.log(`No operation found for master_map_id: ${masterMapId}, skipping...`)
      return
    }

    // Take the first operation from the results
    const operationData = operationsData[0]
    
    if (operationsData.length > 1) {
      console.log(`Note: Found ${operationsData.length} operations for this master_map_id. Using operation_id: ${operationData.id}`)
    }

    // Fetch all data points for the specified master_map_id
    const { data: trailData, error } = await supabase
      .from('trail_data')
      .select('*')
      .eq('master_map_id', masterMapId)
      .order('vehicle_id', { ascending: true })
      .order('timestamp', { ascending: true })

    if (error) {
      console.error(`Error fetching trail data for ${masterMapId}: ${error.message}`)
      return
    }

    if (!trailData || trailData.length === 0) {
      console.log(`No trail data found for master_map_id: ${masterMapId}, skipping...`)
      return
    }

    console.log(`Retrieved ${trailData.length} data points`)

    // Group the data points into trails
    const trails = groupIntoTrails(trailData)

    console.log(`Grouped data into ${trails.length} trails`)

    // Process each trail
    for (let index = 0; index < trails.length; index++) {
      const trail = trails[index]
      console.log(`\nProcessing Trail ${index + 1}/${trails.length}:`)
      console.log(`Operation ID: ${operationData.id}`)
      console.log(`Vehicle ID: ${trail[0].vehicle_id}`)
      console.log(`Start Time: ${convertTimestamp(trail[0].timestamp)}`)
      console.log(`End Time: ${convertTimestamp(trail[trail.length - 1].timestamp)}`)
      console.log(`Color: ${trail[0].color}`)
      console.log(`Swath: ${trail[0].swath}`)
      console.log(`Number of points: ${trail.length}`)
      
      // Create detailed LineStringM with timestamps
      const detailedLineString = trail.map(point => {
        const match = point.coordinates.match(/\((.+),(.+)\)/)
        if (match) {
          const [, longitude, latitude] = match
          return `${longitude} ${latitude} ${point.timestamp}`
        }
        return null
      }).filter(Boolean).join(',')

      const detailedPath = `SRID=4326;LINESTRING M(${detailedLineString})`

      // Create simplified LineString for rendering
      const pathForSimplification = trail.map(point => {
        const match = point.coordinates.match(/\((.+),(.+)\)/)
        if (match) {
          return {
            coordinates: point.coordinates
          }
        }
        return null
      }).filter(Boolean)

      const simplifiedPath = simplifyPath(pathForSimplification, 0.0000035)

      const simplifiedLineString = simplifiedPath.map(point => {
        const coords = point.coordinates.match(/\((.*?),(.*?)\)/)
        return `${coords[1]} ${coords[2]}`
      }).join(',')

      const path = `SRID=4326;LINESTRING(${simplifiedLineString})`

      console.log(`Generated LineStrings:`)
      console.log(`Detailed points: ${trail.length}`)
      console.log(`Simplified points: ${simplifiedPath.length}`)
      console.log(`Reduction: ${Math.round((1 - simplifiedPath.length / trail.length) * 100)}%`)

      // Insert this trail into the database
      const { error: insertError } = await supabase
        .from('trails')
        .insert({
          operation_id: operationData.id,
          vehicle_id: trail[0].vehicle_id,
          start_time: convertTimestamp(trail[0].timestamp),
          end_time: convertTimestamp(trail[trail.length - 1].timestamp),
          trail_color: trail[0].color,
          trail_width: trail[0].swath,
          detailed_path: detailedPath,
          path: path
        })

      if (insertError) {
        console.error(`Error inserting trail ${index + 1}:`, insertError)
      } else {
        console.log(`Successfully inserted trail ${index + 1}/${trails.length}`)
      }
    }

    console.log(`\nCompleted processing for master_map_id: ${masterMapId}`)
    console.log(`Total trails processed: ${trails.length}`)

  } catch (error) {
    console.error(`Error processing master_map_id ${masterMapId}:`, error)
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

async function main() {
  try {
    if (!PROCESS_ALL_MAPS) {
      // Process single map
      await processTrailData(SINGLE_MAP_ID)
    } else {
      // Process all maps
      const masterMapIds = await getAllMasterMapIds()
      console.log(`Found ${masterMapIds.length} master maps to process`)
      
      for (const mapId of masterMapIds) {
        await processTrailData(mapId)
      }
    }
    console.log('\nFinished processing all trail data')
  } catch (error) {
    console.error('Fatal error:', error)
  }
}

main()