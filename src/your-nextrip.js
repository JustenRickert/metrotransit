import React, { useEffect, useState, useRef } from "react";
import { useRecoilValue } from "recoil";
import Leaflet from "leaflet";

import { yourNextripAtom } from "./state";

import "leaflet/dist/leaflet.css";
import "./your-nextrip.css";

function Departures({ yourNextrip }) {
  const [showAll, setShowAll] = useState(false);
  const renderDepartureTr = (departure) => (
    <tr key={departure.trip_id}>
      <td className="t-route">{departure.route_short_name}</td>
      <td className="t-destination">{departure.description}</td>
      <td className="t-departs">{departure.departure_text}</td>
    </tr>
  );
  return (
    <div className="departures">
      <table>
        <thead>
          <tr>
            <th className="t-route">Route</th>
            <th className="t-destination">Destination</th>
            <th className="t-departs">Departs</th>
          </tr>
        </thead>
        <tbody>
          {yourNextrip.departures.slice(0, 3).map(renderDepartureTr)}
          {showAll && yourNextrip.departures.slice(3).map(renderDepartureTr)}
        </tbody>
      </table>
      {yourNextrip.departures.length > 3 && (
        <button onClick={() => setShowAll((t) => !t)}>
          {showAll ? "-" : "+"} departures
        </button>
      )}
    </div>
  );
}

function setLeafletMapMarker(
  map,
  [latitude, longitude],
  { description, autoPan, autoOpen }
) {
  const marker = Leaflet.marker([latitude, longitude], {
    alt: description,
    autoPan,
    icon: Leaflet.icon({
      iconUrl:
        "https://www.openstreetmap.org/assets/marker-green-65a7328dedf1e8396deb167927d899ce3b08ca17f323302db66620db1f3bb97f.png",
      shadowUrl:
        "https://www.openstreetmap.org/assets/leaflet/dist/images/marker-shadow-a2d94406ba198f61f68a71ed8f9f9c701122c0c33b775d990edceae4aece567f.png",
    }),
  }).addTo(map);

  const popup = Leaflet.popup({
    autoPan,
  })
    .setLatLng({ lat: latitude, lng: longitude })
    .setContent(`<b>${description}</b>`);

  if (autoOpen) popup.openOn(map);

  marker.bindPopup(popup);
}

function initializeLeafletMap(mapRef, [latitude, longitude]) {
  mapRef.current = Leaflet.map("map", {
    center: [latitude, longitude],
    zoom: 13,
  });
  Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapRef.current);
}

export function YourNextrip({ route, direction, stop }) {
  const map = useRef();
  const [userCoords, setUserCoords] = useState(null);
  const yourNextrip = useRecoilValue(
    yourNextripAtom(
      [route.route_id, direction.direction_id, stop.place_code].join(".")
    )
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (geo) => setUserCoords(geo.coords),
      console.error
    );
  }, []);

  // on user coordinates
  useEffect(() => {
    if (!userCoords) return;
    const { latitude, longitude } = userCoords;
    setLeafletMapMarker(map.current, [latitude, longitude], {
      autoPan: false,
      autoOpen: false,
      description: "You",
    });
  }, [userCoords]);

  // on stop update
  useEffect(() => {
    if (!map.current) return;
    const { latitude, longitude, description } = yourNextrip.stops[0];
    map.current.setView([latitude, longitude]);
    setLeafletMapMarker(map.current, [latitude, longitude], {
      description,
      autoOpen: true,
    });
  }, [yourNextrip]);

  // on mount initialize map
  useEffect(() => {
    const { latitude, longitude, description } = yourNextrip.stops[0];
    initializeLeafletMap(map, [latitude, longitude]);
    setLeafletMapMarker(map.current, [latitude, longitude], {
      description,
      autoOpen: true,
    });
  }, []);

  return (
    <>
      <h2>{route.route_label}</h2>
      <Departures yourNextrip={yourNextrip} />
      <div style={{ height: 400, width: 600 }} id="map" />
    </>
  );
}
