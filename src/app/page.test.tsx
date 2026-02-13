import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home page", () => {
  it("renders the slice 1 heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /mtg price tracker/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/slice 1 foundation/i)).toBeInTheDocument();
  });
});
