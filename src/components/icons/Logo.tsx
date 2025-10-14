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
    <path d="M21 4H3" />
    <path d="M18 8H6" />
    <path d="M15 12H9" />
    <path d="M12 16h-1" />
    <path d="M9 20h2" />
  </svg>
);

export default Logo;
