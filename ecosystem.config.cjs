module.exports = {
  apps : [
    {
      name: "NurseTec-BACKEND",
      script: "./server/server.js",
      watch: true,
      ignore_watch: ["node_modules", "server/db.json"],
      env: {
        PORT: 4000,
        NODE_ENV: "production"
      }
    }
    // A PARTE DO FRONTEND FOI REMOVIDA PORQUE O NGINX VAI CUIDAR DISSO
  ]
}