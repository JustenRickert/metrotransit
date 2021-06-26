import React, { useEffect, Suspense, useState, useReducer } from "react";
import { useRecoilValue } from "recoil";

import { RoutesSelect, DirectionsSelect, StopsSelect } from "./select";
import { directionsAtom, routesAtom, stopsAtom, useRouter } from "./state";
import { YourNextrip } from "./your-nextrip";

import "./app.css";

function LoadingDots() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const i = setTimeout(() => {
      setMounted(true);
    }, 300);
    return () => {
      clearTimeout(i);
    };
  }, []);
  if (!mounted) return <div className="loading-dots" />;
  return (
    <div className="loading-dots">
      <div className="loading-dot">.</div>
      <div className="loading-dot">.</div>
      <div className="loading-dot">.</div>
      <div className="loading-dot">.</div>
    </div>
  );
}

function isAction(action) {
  return action && "type" in action;
}

function isRoute(data) {
  return data && "route_id" in data;
}

function isDirection(data) {
  return data && "direction_id" in data;
}

function isStop(data) {
  return data && "place_code" in data;
}

function cond(conditions) {
  return (x) => {
    for (const [predicate, fn] of conditions) {
      if (predicate(x)) return fn(x);
    }
  };
}

const defaultState = {
  route: null,
  direction: null,
  stop: null,
};

function reducer(state, dataOrAction) {
  if (isAction(dataOrAction)) {
    switch (dataOrAction.type) {
      case "reset":
        switch (dataOrAction.which) {
          case "direction":
            return {
              ...state,
              direction: null,
              stop: null,
            };
          case "stop":
            return {
              ...state,
              stop: null,
            };
        }
      default:
        throw new Error("not impl");
    }
  }
  const fn = cond([
    [isRoute, (route) => ({ route, direction: null, stop: null })],
    [isDirection, (direction) => ({ ...state, direction, stop: null })],
    [isStop, (stop) => ({ ...state, stop })],
    [() => true, () => defaultState],
  ]);
  return fn(dataOrAction);
}

function BusIcon() {
  const [wiggle, setWiggle] = useState();
  useEffect(() => {
    setTimeout(() => {
      setWiggle(true);
    }, 250);
  }, []);
  return (
    <div
      style={{
        transform: "translate(-3px, 4px)",
      }}
    >
      <img
        style={{ position: "absolute", opacity: 0 }}
        className={wiggle && "wiggle-lines"}
        width={50}
        height={50}
        src="/images/bus-wiggles.png"
      />
      <img
        className={wiggle && "wiggle"}
        width={50}
        height={50}
        src="/images/bus.png"
      />
    </div>
  );
}

export function App({ initialState = null }) {
  const [{ route, direction, stop }, setState] = useReducer(
    reducer,
    initialState || defaultState
  );

  useRouter({
    route,
    direction,
    stop,
  });

  return (
    <div className="app">
      <div className="headline">
        <h1>
          <BusIcon />
          Take the Bus
        </h1>
      </div>

      <h2>Real-time Departures</h2>
      <div className="app-selection">
        <Suspense fallback={<LoadingDots />}>
          <RoutesSelect initialRouteId={route?.route_id} onChange={setState} />
        </Suspense>
        <Suspense fallback={<LoadingDots />}>
          {route && (
            <DirectionsSelect
              initialDirectionId={direction?.direction_id}
              route={route}
              onChange={(e) =>
                e
                  ? setState(e)
                  : setState({ type: "reset", which: "direction" })
              }
            />
          )}
        </Suspense>
        <Suspense fallback={<LoadingDots />}>
          {route && direction && (
            <StopsSelect
              initialPlaceCode={stop?.place_code}
              route={route}
              direction={direction}
              onChange={(e) =>
                e ? setState(e) : setState({ type: "reset", which: "stop" })
              }
            />
          )}
        </Suspense>
      </div>

      {route && direction && stop && (
        <div className="your-nextrip">
          <Suspense fallback={<LoadingDots />}>
            {<YourNextrip route={route} direction={direction} stop={stop} />}
          </Suspense>
        </div>
      )}
    </div>
  );
}

function _AppWithInitialState({ routeId, directionId, stopId }) {
  const { routes } = useRecoilValue(routesAtom);
  const { directions } = useRecoilValue(directionsAtom(routeId));
  const { stops } = useRecoilValue(stopsAtom([routeId, directionId].join(".")));
  return (
    <App
      initialState={{
        route: routes[routeId],
        direction: directions[directionId],
        stop: stops[stopId],
      }}
    />
  );
}

export function AppWithInitialState(props) {
  return (
    <Suspense fallback={<LoadingDots />}>
      <_AppWithInitialState {...props} />
    </Suspense>
  );
}
