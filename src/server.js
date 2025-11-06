import { createApp } from './app.js';
import { database } from './config/database.js';
import { env } from './config/env.js';
import "./models/index.js"

const bootstrap = async () => {
    try {
        console.log('🔄 Starting application...');

        // Initialize application
        const app = createApp();
        console.log('✅ Application initialized');

        // Connect to database
        await database.authenticate();
        console.log('✅ Database connected successfully');

        // Start HTTP server
        app.listen(env.port, () => {
            console.log(`🚀 Server running on port ${env.port}`);
            console.log(`📍 Environment: ${env.nodeEnv || 'development'}`);
        });

    } catch (error) {
        console.error('❌ Failed to start application:', error);
        process.exit(1);
    }
};

await bootstrap();
