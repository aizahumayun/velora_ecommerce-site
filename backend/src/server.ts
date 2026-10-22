import { app } from './app.js';
import { config } from './config.js';
import { connectDB, disconnectDB } from './db.js';
import { seedProductsIfEmpty } from './seed.js';

async function startServer() {
  const server = app.listen(config.port, '0.0.0.0', async () => {
    console.log(`VELORA API is running on http://0.0.0.0:${config.port} (${config.nodeEnv})`);

    const connected = await connectDB();
    if (connected) {
      try {
        await seedProductsIfEmpty();
      } catch (seedErr) {
        console.error('Error during initial product seeding:', seedErr);
      }
    }
  });

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down VELORA API gracefully...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return { app, server };
}

startServer().catch((err) => {
  console.error('Fatal error starting VELORA API:', err);
  process.exit(1);
});
