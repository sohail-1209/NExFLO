import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 12c-3 0-6 2-6 5s3 5 6 5 6-2 6-5" />
    <path d="M12 12c3 0 6-2 6-5s-3-5-6-5-6 2-6 5" />
    <path d="M19 9a2 2 0 0 0 2 2" />
    <path d="M5 15a2 2 0 0 0-2-2" />
  </svg>
);

export default Logo;
