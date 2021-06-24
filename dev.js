import path from "path";
import { watch as rollupWatch } from "rollup";
import Fastify from "fastify";
import fastifyStatic from "fastify-static";
import FastifyWebsocket from "fastify-websocket";

const fastify = Fastify({ logger: false });
fastify.register(FastifyWebsocket);

import rollupConfig from "./rollup.config.js";

let developmentConnection;

(async () => {
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), "dist"),
  });

  fastify.setNotFoundHandler((req, rep) => {
    rep.sendFile("index.html");
  });

  fastify.get("/refresh", { websocket: true }, (connection, req) => {
    developmentConnection = connection;
  });

  fastify.listen(3000, (err, address) => {
    if (err) throw err;
    fastify.log.info(`server started @ ${address}`);
  });

  const watcher = rollupWatch(rollupConfig);
  watcher.on("event", (e) => {
    switch (e.code) {
      case "START":
      case "BUNDLE_START":
      case "END":
        break;
      case "ERROR":
        console.log();
        console.error(e.error.code);
        console.error(e.error.toString());
        if (e.error.loc) console.error(e.error.loc.file);
        console.error(e.error.frame);
        break;
      case "BUNDLE_END":
        if (developmentConnection) developmentConnection.socket.send("RELOAD");
        // TODO send reload
        console.log("bundled");
        break;
      default:
        console.log("Event not handled:", e.code);
    }
  });
})();
