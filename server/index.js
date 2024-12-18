import { server } from "./app.js";
import { connectToDB, shutdownGracefully } from './db/connection.db.js';
import { ApiError } from './utils/ApiError.js';
import * as dotenv from 'dotenv';

(async function startServer() {
    try {
        await connectToDB(process.env.DB_URI);
        console.log("✅ Database connected successfully.");

        const PORT = process.env.PORT || 3000;
        const Server = server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

        function closeServer(server) {
            return new Promise((resolve, reject) => {
                server.close((err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        process.on('SIGINT', async () => {
            try {
                console.log("\n🛑 Shutting down gracefully...");
                await closeServer(server);
                console.log("⚡ Server stopped.");
                await shutdownGracefully();
                console.log("✅ Database disconnected.");
                process.exit(0);
            } catch (err) {
                console.error("❌ Error during shutdown:", err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error(new ApiError(500, "Database connection failed."), error);
        process.exit(1);
    }
})();
