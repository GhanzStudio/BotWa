module.exports = {
  apps: [
    {
      name: 'ghanz-wa-bot',
      script: 'server.ts',
      interpreter: 'node_modules/.bin/tsx',
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      restart_delay: 4000,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true
    }
  ]
};
