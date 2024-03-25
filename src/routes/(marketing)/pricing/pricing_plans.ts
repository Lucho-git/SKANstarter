export const defaultPlanId = "free"

export const pricingPlans = [
  {
    id: "free",
    name: "SKAN Demo Plan",
    description: "A free plan to show you what path planning looks like!",
    price: "Free",
    priceIntervalName: "forever",
    stripe_price_id: null,
    features: ["Paddock Upload", "PaddockPath for up to 10 paddocks", "Tramline Optimization Tool"],
  },
  {
    id: "pro",
    name: "★ SKAN Pro ",
    description: "Unlimited access to our PathPlanner for all your farming needs",
    price: "$49.99",
    priceIntervalName: "per month",
    stripe_price_id: "price_1OonE0K3At0l0k1HWV3Z1vF7",
    stripe_product_id: "prod_Pe5OlROS4oPoC7",
    features: [
      "Everything in Free",
      "Unlimited PaddockPaths",
      "Export your PaddockPath files",
    ],
  },

  {
    id: "enterprise",
    name: "⭐ SKAN Unlimited",
    description:
      "This plan is only avaliable for a limited time and is our way of rewarding our founding clients.",
    price: "$999",
    priceIntervalName: "Once only",
    stripe_price_id: "price_1Ox3igK3At0l0k1H6Gh0IINk",
    stripe_product_id: "prod_PSlUxQsqZIwjGk",
    features: [
      "One time payment for lifetime access to all SKAN products",
      "Never pay a subscription fee, guaranteed",
    ],
  },
]
