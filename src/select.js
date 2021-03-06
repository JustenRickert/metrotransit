import React, { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";

import { directionsAtom, stopsAtom, routesAtom } from "./state";

export const RoutesSelect = function RouteSelect({ routeId = "", onChange }) {
  const [{ ids, routes }] = useRecoilState(routesAtom);
  return (
    <select value={routeId} onChange={(e) => onChange(routes[e.target.value])}>
      <option key="" value="">
        Select a route
      </option>
      {ids.map((id) => (
        <option value={id} key={id}>
          {routes[id].route_label}
        </option>
      ))}
    </select>
  );
};

export function DirectionsSelect({ initialDirectionId = "", route, onChange }) {
  const ref = useRef();
  const [{ ids, directions }] = useRecoilState(directionsAtom(route.route_id));
  useEffect(() => {
    ref.current.value = initialDirectionId;
  }, [route]);
  return (
    <select
      value={initialDirectionId}
      ref={ref}
      onChange={(e) => onChange(directions[e.target.value])}
    >
      <option key="" value="">
        Select directions
      </option>
      {ids.map((id) => (
        <option value={id} key={id}>
          {directions[id].direction_name}
        </option>
      ))}
    </select>
  );
}

export function StopsSelect({
  initialPlaceCode = "",
  route,
  direction,
  onChange,
}) {
  const ref = useRef();
  const [{ ids, stops }] = useRecoilState(
    stopsAtom([route.route_id, direction.direction_id].join("."))
  );
  useEffect(() => {
    ref.current.value = initialPlaceCode;
  }, [route, direction]);
  return (
    <select
      value={initialPlaceCode}
      ref={ref}
      onChange={(e) => onChange(stops[e.target.value])}
    >
      <option key="" value="">
        Select directions
      </option>
      {ids.map((id) => (
        <option value={id} key={id}>
          {stops[id].description}
        </option>
      ))}
    </select>
  );
}
