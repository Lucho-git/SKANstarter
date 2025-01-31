import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

console.log('Environment variables:', {
    supabaseUrl: process.env.PUBLIC_SUPABASE_URL,
    edgeFunctionUrl: process.env.SUPABASE_EDGE_FUNCTION_URL
})

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)
const EDGE_FUNCTION_URL = process.env.SUPABASE_EDGE_FUNCTION_URL || 'https://hmxxqacnzxqpcheoeidn.supabase.co/functions/v1/resend-add-contact'

async function updateEmailList() {
    try {
        let allUsers = []
        let page = 1
        let hasMore = true

        // Fetch all users with pagination
        while (hasMore) {
            const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
                page: page,
                perPage: 1000
            })

            if (usersError) {
                throw new Error(`Error fetching users page ${page}: ${usersError.message}`)
            }

            if (users.length === 0) {
                hasMore = false
            } else {
                allUsers = [...allUsers, ...users]
                page++
            }
        }

        console.log(`Found ${allUsers.length} total users`)

        // For each user, fetch their full name and add to Resend
        for (const user of allUsers) {
            try {
                // Fetch full name from profiles using the auth user id
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()

                if (profileError) {
                    console.error(`Error fetching profile for ${user.email}:`, profileError)
                    continue
                }

                // Call Resend edge function
                const response = await fetch(EDGE_FUNCTION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.PRIVATE_SUPABASE_SERVICE_ROLE}`
                    },
                    body: JSON.stringify({
                        email: user.email,
                        fullName: profileData?.full_name || ''
                    })
                })

                const responseData = await response.text()
                
                console.log(`Processed ${user.email}:`, {
                    status: response.status,
                    response: responseData
                })

                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000))

            } catch (error) {
                console.error(`Error processing user ${user.email}:`, error)
            }
        }

        console.log('\n=== Summary ===')
        console.log(`Total users processed: ${allUsers.length}`)

    } catch (error) {
        console.error('Error updating email list:', error)
    }
}

updateEmailList()
    .then(() => console.log('\nUpdate complete'))
    .catch(console.error)