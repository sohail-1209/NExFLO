import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 6v12" />
    <path d="M15 6H9a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h4" />
    <path d="M15 12H9" />
    <path d="M5 6v12" />
  </svg>
);

export default Logo;
