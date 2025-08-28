import { fastify } from "fastify";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import cors from "@fastify/cors"; // ✅ add this
import routes from "./connect";

async function main() {
  const server = fastify();

  await server.register(cors, {
    origin: "*", // or ["http://localhost:3000"]
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "connect-protocol-version", // ✅ add this
      "connect-content-encoding",
      "connect-accept-encoding"
    ],
  });


  // Register Connect RPC routes
  await server.register(fastifyConnectPlugin, {
    routes,
  });

  // Basic HTTP route for testing
  server.get("/", (_, reply) => {
    reply.type("text/plain");
    reply.send("Hello World!");
  });

  await server.listen({ host: "0.0.0.0", port: 8085 });
  console.log("server is listening at", server.addresses());
}

void main();
