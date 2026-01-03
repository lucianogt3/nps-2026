module.exports = {
  apps : [
    {
      name: "NurseTec-BACKEND",
      script: "./server/server.js",
      watch: true,
      ignore_watch: ["node_modules", "db.json"],
      env: {
        PORT: 4000,
        NODE_ENV: "production",
      }
    },
    {
      name: "NurseTec-FRONTEND",
      script: "npm",
      args: "run dev",
      env: {
        PORT: 5007 
      }
    }
  ]
}