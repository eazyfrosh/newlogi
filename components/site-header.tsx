"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  ["Services", "/services"],
  ["About", "/about"],
  ["Track", "/track"],
  ["Contact", "/contact"],
];
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="brand" href="/" aria-label="NewLogi home">
          <span className="brand-mark">N</span>
          <span>
            newlogi<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav
          className={`desktop-nav ${open ? "nav-open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => (
            <Link key={href} onClick={() => setOpen(false)} href={href}>
              {label}
            </Link>
          ))}
          <Link className="nav-mobile-cta" href="/quote">
            Get a quote <ArrowUpRight size={15} />
          </Link>
        </nav>
        <div className="header-actions">
          <Link className="login-link" href="/login">
            Log in
          </Link>
          <Link className="button button-dark button-small" href="/quote">
            Get a quote <ArrowUpRight size={15} />
          </Link>
        </div>
        <button
          className="mobile-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
