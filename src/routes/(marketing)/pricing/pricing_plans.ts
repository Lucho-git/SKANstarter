export const defaultPlanId = "free"

export const pricingPlans = [
  {
    id: "free",
    name: "SKAN Member",
    description: "Join an existing map as an operator, or test out our features free",
    price: "Free",
    priceIntervalName: "no credit card required",
    stripe_price_id: null,
    features: ["Unlimited Map Creation", "Unlimited pin drops","Join other maps" ,"All vehicle options", "Colored Trails", "Real time location updates"],
  },
  {
    id: "pro",
    name: "⭐ SKAN Owner ",
    description: "Invite other users to your map, completely adjustable # of seats",
    price: "$49.99",
    priceIntervalName: "per month",
    stripe_price_id: "price_1OzChIK3At0l0k1He2S2jBKD",
    stripe_product_id: "prod_PoqONAH5P73MD4",
    features: [
      "Everything in Free",
      "Invite other users to your map",
      "Premium support",
    ],
  },

  {
    id: "enterprise",
    name: "★ SKAN Enterprise",
    description:
      "Want to integrate SKAN into your business? Contact us for a custom quote",
    price: "$999",
    priceIntervalName: "Once only",
    stripe_price_id: "price_1Oy7FOK3At0l0k1HrMFJ1gcc",
    stripe_product_id: "prod_Pniga3XFPsLAuM",
    features: [
      "One time payment for lifetime access to all SKAN products",
      "Never pay a subscription fee, guaranteed",
    ],
  },
]
