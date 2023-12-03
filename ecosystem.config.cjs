module.exports = {
  apps: [{
    name: "cats-n-mice",
    script: "bun .",
    env_production: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development"
    }
  }]
}
