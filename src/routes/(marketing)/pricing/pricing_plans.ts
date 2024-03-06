export const defaultPlanId = "free"

export const pricingPlans = [
  {
    id: "free",
    name: "SKAN Demo Plan",
    description: "A free plan to show you what path planning looks like!",
    price: "Free",
    priceIntervalName: "forever",
    stripe_price_id: null,
    features: ["Paddock Upload", "Pathplanning for up to 4 paddocks"],
  },
  {
    id: "pro",
    name: "★ SKAN Pro ",
    description: "Unlimited access to pathplanning for all your harvest needs",
    price: "$49.99",
    priceIntervalName: "per month",
    stripe_price_id: "price_1OonE0K3At0l0k1HWV3Z1vF7",
    stripe_product_id: "prod_Pe5OlROS4oPoC7",
    features: [
      "Everything in Free",
      "Unlimited Paddock Pathplanning",
      "Download and keep your path files",
    ],
  },
  {
    id: "enterprise",
    name: "⭐ SKAN Ultimate",
    description:
      "The best plan you can get, giving you access to live paddock directions from within your vehicle",
    price: "$199.99",
    priceIntervalName: "per month",
    stripe_price_id: "price_1OdpxJK3At0l0k1HOx5Kxo9S",
    stripe_product_id: "prod_PSlUxQsqZIwjGk",
    features: [
      "Everything in Demo & Pro",
      "Live display for operators to use ",
      "Actual Paddock directions can be given to new and novice operators",
    ],
  },
]
