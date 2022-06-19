const { withPlausibleProxy } = require("next-plausible")

module.exports = withPlausibleProxy()({
  reactStrictMode: true,
  images: {
    domains: ["raw.githubusercontent.com"],
    minimumCacheTTL: 6000000,
  },
})
