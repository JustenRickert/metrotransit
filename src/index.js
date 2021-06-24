import React from "react";
import { render } from "react-dom";
import { RecoilRoot } from "recoil";

import { App, AppWithInitialState } from "./app";

function Root({ children }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}

const url = new URL(window.location);

const pathResult = /(\d+)\/(\d+)\/([\d\w]+)/.exec(url.pathname);

if (!pathResult) {
  render(
    <Root>
      <App />
    </Root>,
    document.getElementById("app")
  );
} else {
  const [, routeId, directionId, stopId] = pathResult;
  render(
    <Root>
      <AppWithInitialState
        routeId={routeId}
        directionId={directionId}
        stopId={stopId}
      />
    </Root>,
    document.getElementById("app")
  );
}

if (process.env.NODE_ENV === "development") {
  const ws = new WebSocket("ws://" + location.host + "/refresh");
  ws.onmessage = () => location.reload();
}
