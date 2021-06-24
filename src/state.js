import { useEffect } from "react";
import { selector, selectorFamily } from "recoil";

const transitUrl = new URL(
  process.env.NODE_ENV === "production"
    ? "https://svc.metrotransit.org"
    : "https://svc.metrotransit.org" // TODO(?) use development url
);

export const routesAtom = selector({
  key: "routes",
  get: () =>
    fetch(transitUrl + "nextripv2/routes")
      .then((r) => r.json())
      .then((routesData) =>
        routesData.reduce(
          ({ ids, routes }, r) => ({
            ids: ids.concat(r.route_id),
            routes: {
              ...routes,
              [r.route_id]: r,
            },
          }),
          {
            ids: [],
            routes: {},
          }
        )
      ),
});

// function wait(ms) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// }

export const directionsAtom = selectorFamily({
  key: "directions",
  get: (routeId) => async () => {
    return fetch(transitUrl + `nextripv2/directions/${routeId}`)
      .then((r) => r.json())
      .then((directionsData) =>
        directionsData.reduce(
          ({ ids, directions }, d) => ({
            ids: ids.concat(d.direction_id),
            directions: {
              ...directions,
              [d.direction_id]: d,
            },
          }),
          {
            ids: [],
            directions: {},
          }
        )
      );
  },
});

export const stopsAtom = selectorFamily({
  key: "stops",
  get: (routeIdDotDirectionId) => () => {
    const [routeId, directionId] = routeIdDotDirectionId.split(".");
    return fetch(transitUrl + `nextripv2/stops/${routeId}/${directionId}`)
      .then((r) => r.json())
      .then((stopsData) =>
        stopsData.reduce(
          ({ ids, stops }, d) => ({
            ids: ids.concat(d.place_code),
            stops: {
              [d.place_code]: d,
              ...stops,
            },
          }),
          {
            ids: [],
            stops: {},
          }
        )
      );
  },
});

// TODO
export const yourNexTripAtom = selectorFamily({
  key: "yournextrip",
  get: (routeIdDotDirectionIdDotStopId) => () => {
    const [routeId, directionId, stopId] = routeIdDotDirectionIdDotStopId.split(
      "."
    );
    return fetch(
      transitUrl + `nextripv2/${routeId}/${directionId}/${stopId}`
    ).then((r) => r.json());
  },
});

export function useRouter({ route, direction, stop }) {
  useEffect(() => {
    if (!route || !direction || !stop) return;
    window.history.replaceState(
      {
        route,
        direction,
        stop,
      },
      "",
      `/${route.route_id}/${direction.direction_id}/${stop.place_code}`
    );
  }, [route, direction, stop]);
}
