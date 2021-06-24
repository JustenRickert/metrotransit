import React, { useEffect, Suspense, useState, useReducer } from "react";
import { useRecoilValue } from "recoil";

import { RouteSelect, DirectionsSelect, StopsSelect } from "./select";
import { directionsAtom, routesAtom, stopsAtom, useRouter } from "./state";

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

function reducer(state, data) {
  const fn = cond([
    [isRoute, (route) => ({ route, direction: null, stop: null })],
    [isDirection, (direction) => ({ ...state, direction, stop: null })],
    [isStop, (stop) => ({ ...state, stop })],
    [() => true, () => defaultState],
  ]);
  return fn(data);
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
      <Suspense fallback={<LoadingDots />}>
        <RouteSelect initialRouteId={route?.route_id} onChange={setState} />
      </Suspense>
      <Suspense fallback={<LoadingDots />}>
        {route && (
          <DirectionsSelect
            initialDirectionId={direction?.direction_id}
            route={route}
            onChange={setState}
          />
        )}
      </Suspense>
      <Suspense fallback={<LoadingDots />}>
        {route && direction && (
          <StopsSelect
            initialPlaceCode={stop?.place_code}
            route={route}
            direction={direction}
            onChange={setState}
          />
        )}
      </Suspense>
    </div>
  );
}
