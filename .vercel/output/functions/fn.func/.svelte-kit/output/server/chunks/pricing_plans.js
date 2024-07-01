const defaultPlanId = "free";
const pricingPlans = [
  {
    id: "free",
    name: "SKAN Demo Plan",
    description: "A free plan to show you what path planning looks like!",
    price: "Free",
    priceIntervalName: "forever",
    stripe_price_id: null,
    features: ["Paddock Upload", "PaddockPath for up to 5 paddocks", "Tramline Optimization Tool"]
  },
  {
    id: "pro",
    name: "★ SKAN Pro ",
    description: "Unlimited access to our PathPlanner for all your farming needs",
    price: "$49.99",
    priceIntervalName: "per month",
    stripe_price_id: "price_1OzChIK3At0l0k1He2S2jBKD",
    stripe_product_id: "prod_PoqONAH5P73MD4",
    features: [
      "Everything in Free",
      "Unlimited PaddockPaths",
      "Export your PaddockPath files"
    ]
  },
  {
    id: "enterprise",
    name: "⭐ SKAN Unlimited",
    description: "This plan is only avaliable for a limited time and is our way of rewarding our founding clients.",
    price: "$999",
    priceIntervalName: "Once only",
    stripe_price_id: "price_1Oy7FOK3At0l0k1HrMFJ1gcc",
    stripe_product_id: "prod_Pniga3XFPsLAuM",
    features: [
      "One time payment for lifetime access to all SKAN products",
      "Never pay a subscription fee, guaranteed"
    ]
  }
];
export {
  defaultPlanId as d,
  pricingPlans as p
};
