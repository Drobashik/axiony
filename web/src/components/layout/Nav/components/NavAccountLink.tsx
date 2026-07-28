import Link from "next/link";
import { ArrowUpRightIcon } from "../icons";

interface NavAccountLinkProps {
  loggedIn: boolean;
  className: string;
  onClick: () => void;
}

export const NavAccountLink = ({ loggedIn, className, onClick }: NavAccountLinkProps) => (
  <Link
    href={loggedIn ? "/dashboard" : "/login"}
    prefetch={false}
    className={className}
    onClick={onClick}
  >
    <span>{loggedIn ? "Dashboard" : "Log in"}</span>
    <ArrowUpRightIcon />
  </Link>
);
