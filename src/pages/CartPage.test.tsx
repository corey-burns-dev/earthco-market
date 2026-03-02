import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useStore } from "../context/StoreContext";
import CartPage from "./CartPage";

vi.mock("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }: ComponentProps<"section">) => (
      <section {...props}>{children}</section>
    ),
  },
}));

vi.mock("../context/StoreContext", () => ({
  useStore: vi.fn(),
}));

const useStoreMock = vi.mocked(useStore);

describe("CartPage", () => {
  beforeEach(() => {
    useStoreMock.mockReset();
  });

  test("renders empty cart state", () => {
    useStoreMock.mockReturnValue({
      cartLines: [],
      cartSubtotal: 0,
      shippingCost: 0,
      cartTotal: 0,
      updateCartQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
    } as ReturnType<typeof useStore>);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Your cart is empty." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse Products" })).toHaveAttribute("href", "/shop");
  });

  test("updates quantity, removes lines, and clears cart", () => {
    const updateCartQuantity = vi.fn();
    const removeFromCart = vi.fn();
    const clearCart = vi.fn();

    useStoreMock.mockReturnValue({
      cartLines: [
        {
          product: {
            id: 12,
            slug: "grove-short",
            name: "Grove Short",
            tagline: "Trail-ready short",
            description: "Comfortable short",
            price: 90,
            category: "ESSENTIALS",
            accent: "#111111",
            heroImage: "https://example.com/grove.jpg",
            gallery: ["https://example.com/grove.jpg"],
            stock: 20,
            rating: 4.8,
          },
          quantity: 2,
          lineTotal: 180,
        },
      ],
      cartSubtotal: 180,
      shippingCost: 12,
      cartTotal: 192,
      updateCartQuantity,
      removeFromCart,
      clearCart,
    } as ReturnType<typeof useStore>);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "+" }));
    fireEvent.click(screen.getByRole("button", { name: "-" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear Cart" }));

    expect(updateCartQuantity).toHaveBeenCalledWith(12, 3);
    expect(updateCartQuantity).toHaveBeenCalledWith(12, 1);
    expect(removeFromCart).toHaveBeenCalledWith(12);
    expect(clearCart).toHaveBeenCalledTimes(1);
  });
});
