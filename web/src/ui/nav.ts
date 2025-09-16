import { NavLink as RouterNavLink, type NavLinkProps } from "react-router-dom";

export const linkClass: NavLinkProps["className"] = ({ isActive, isPending }) =>
  [
    "px-2 py-1 rounded no-underline",
    isActive ? "text-white bg-gray-900" : "text-black",
    isPending ? "opacity-70" : "",
  ].join(" ");

export { RouterNavLink as NavLink };
