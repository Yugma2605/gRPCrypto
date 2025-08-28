import { fastify } from "fastify";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import routes from "./connect";

async function main() {
  const server = fastify();

  // Register Connect RPC routes
  await server.register(fastifyConnectPlugin, {
    routes,
  });

  // Basic HTTP route for testing
  server.get("/", (_, reply) => {
    reply.type("text/plain");
    reply.send("Hello World!");
  });

  await server.listen({ host: "localhost", port: 8085 });
  console.log("server is listening at", server.addresses());
}

void main();
