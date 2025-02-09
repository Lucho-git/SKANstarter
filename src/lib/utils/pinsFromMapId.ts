// lib/utils/pinsFromMapId.ts
import { supabase } from '$lib/supabaseClient'
import type { PostgrestError } from '@supabase/supabase-js'

export interface PinData {
    type: "Feature"
    geometry: {
        type: "Point"
        coordinates: number[]
    }
    properties: {
        id: string
        icon: string
    }
}

export interface MapMarker {
    id: number
    master_map_id: string
    updated_at: string
    marker_data: PinData
    deleted: boolean
}

export interface PinsResponse {
    data: MapMarker[] | null
    error: PostgrestError | null
}

export async function getPinsFromMapId(mapId: string): Promise<PinsResponse> {
    const { data, error } = await supabase
        .from('map_markers')
        .select('*')
        .eq('master_map_id', mapId)
        .order('updated_at', { ascending: false })

    return { data, error }
}