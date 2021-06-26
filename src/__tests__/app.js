/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "react-dom";
import { RecoilRoot } from "recoil";

import { App } from "../app";

function Root({ children }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}

jest.mock("../select", () => ({
  RoutesSelect: () => "RoutesSelect",
  DirectionsSelect: () => "DirectionsSelect",
  StopsSelect: () => "StopsSelect",
}));

jest.mock("../your-nextrip", () => ({
  YourNextrip: () => "YourNextrip",
}));

describe("app", () => {
  it("renders, and renders routes select initially", () => {
    const div = document.createElement("div");
    render(
      <Root>
        <App />
      </Root>,
      div
    );
    expect(div.querySelector(".app-selection")).toBeTruthy();
    expect(div.querySelector(".app-selection").innerHTML).toBe("RoutesSelect");
  });

  it("renders routes & directions selects initially with inital route state", () => {
    const div = document.createElement("div");
    render(
      <Root>
        <App initialState={{ route: { route_id: "id" } }} />
      </Root>,
      div
    );
    expect(div.querySelector(".app-selection").innerHTML).toBe(
      "RoutesSelectDirectionsSelect"
    );
  });

  it("renders routes & directions & stops selects initially with inital route & directions state", () => {
    const div = document.createElement("div");
    render(
      <Root>
        <App
          initialState={{
            route: { route_id: "id" },
            direction: { direction_id: "id" },
          }}
        />
      </Root>,
      div
    );
    expect(div.querySelector(".app-selection").innerHTML).toBe(
      "RoutesSelectDirectionsSelectStopsSelect"
    );
  });

  it("renders yournextrip initially with inital route & directions & stops state", () => {
    const div = document.createElement("div");
    render(
      <Root>
        <App
          initialState={{
            route: { route_id: "id" },
            direction: { direction_id: "id" },
            stop: { place_code: "id" },
          }}
        />
      </Root>,
      div
    );
    expect(div.querySelector(".your-nextrip").innerHTML).toBe("YourNextrip");
  });
});
