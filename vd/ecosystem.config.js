module.exports = {
  apps: [
    {
      name: "trading-platform-api",
      script: "./dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      merge_logs: true,
      time: true,
    },
    {
      name: "trading-platform-worker",
      script: "./dist/workers/copyTradeWorker.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/worker-error.log",
      out_file: "logs/worker-out.log",
      merge_logs: true,
      time: true,
    },
  ],
}
