export const defaultPlanId = "free"

export const pricingPlans = [
    {
      id: "free",
      name: "🚜SKAN Member",
      description:
        "Join an existing map as an operator, or test out our features free",
      price: {
        monthly: { original: "Free", discounted: "Free" },
        yearly: { original: "Free", discounted: "Free" },
      },
      priceIntervalName: {
        monthly: "no credit card required",
        yearly: "no credit card required",
      },
      stripe_price_id: { monthly: null, yearly: null },
      features: [
        "Join other maps with unlimited resources",
        "1 Map Creation",
        "100 active pin drops",
        "100 000 Trail tokens",
        "Real time location updates",
      ],
      style: "bg-gray-100 border-gray-200",
    },
    {
      id: "pro",
      name: "⭐ SKAN Founder",
      description:
        "Invite other users to your map, completely adjustable # of seats",
      price: {
        monthly: { original: "$45", discounted: "$45" },
        yearly: { original: "$45", discounted: "$30.4" },
      },
      priceIntervalName: { monthly: "per month", yearly: "per year" },
      stripe_price_id: {
        monthly: 'price_1PkkO8K3At0l0k1HqvxEEBw2',
        yearly: "price_1PdxlVK3At0l0k1HoEgkFynm",
      },
      stripe_product_id: "prod_QUxgzq6c3meKyZ",
      features: [
        "Invite others to share your map",
        "Customizable # of seats",
        "Unlimited map creation",
        "Unlimited pin drops",
        "Unlimited Trail credits",
        "All vehicles unlocked",
      ],
      style: "bg-blue-100 border-blue-300",
    },
  ]