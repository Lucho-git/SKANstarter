<script>
  import { userStore } from "../stores/userStore"
  import { supabase } from "$lib/supabaseClient"
  import { toast } from "svelte-sonner"
  import { PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"

  async function triggerEdgeFunction() {
    let sentCount = 0
    let successCount = 0
    let failCount = 0

    // Fetch all subscribed users
    const { data: subscribers, error: subscriberError } = await supabase
      .from("email_subscribers")
      .select("id, email, is_subscribed")
      .eq("is_subscribed", true)

    if (subscriberError) {
      console.error("Error fetching subscriber data:", subscriberError)
      toast.error("Error fetching subscriber data")
      return
    }

    // Fetch all profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")

    if (profileError) {
      console.error("Error fetching profile data:", profileError)
      toast.error("Error fetching profile data")
      return
    }

    // Create a map of profiles for quick lookup
    const profileMap = new Map(
      profiles.map((profile) => [profile.id, profile.full_name]),
    )

    const edgeFunctionPromises = subscribers.map(async (subscriber) => {
      const fullName = profileMap.get(subscriber.id) || "NoName"
      const edgeFunctionData = {
        email: subscriber.email,
        fullName: fullName,
      }

      sentCount++
      console.log("Calling Resend Edge function for:", edgeFunctionData.email)

      try {
        const response = await fetch(
          "https://hmxxqacnzxqpcheoeidn.supabase.co/functions/v1/resend-add-contact",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer" + PUBLIC_SUPABASE_ANON_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(edgeFunctionData),
          },
        )

        const data = await response.json()
        if (response.ok) {
          successCount++
          return {
            email: edgeFunctionData.email,
            status: "success",
            message: data.message,
          }
        } else {
          failCount++
          return {
            email: edgeFunctionData.email,
            status: "fail",
            error: data.error,
          }
        }
      } catch (error) {
        failCount++
        return {
          email: edgeFunctionData.email,
          status: "fail",
          error: error.message,
        }
      }
    })

    const results = await Promise.all(edgeFunctionPromises)

    console.log("Edge function results:", results)
    console.log(`Total emails processed: ${sentCount}`)
    console.log(`Successful: ${successCount}, Failed: ${failCount}`)

    toast.success(
      `Processed ${sentCount} emails. Success: ${successCount}, Failed: ${failCount}`,
    )
  }
</script>

<div class="fixed bottom-8 right-28 z-50 flex flex-col items-end">
  <button
    class="btn btn-circle btn-primary btn-lg"
    on:click={triggerEdgeFunction}
  >
    <i class="at-audio-wave"></i>
  </button>
</div>
