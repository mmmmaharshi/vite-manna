import type { SVGProps } from "react";

// Open book and a manna drop. Single colour (currentColor) so it follows the theme.
const IconSVG = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" {...props}>
    <path
      d="M32 53.5C26 49 19.5 47.5 12.5 48.5V24c7-1 13.5.5 19.5 4.5 6-4 12.5-5.5 19.5-4.5v24.5c-7-1-13.5.5-19.5 5Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
    />
    <path
      d="M32 28.5v25"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={4}
    />
    <path
      d="M32 10c2.1 2.9 3.4 4.7 3.4 6.4a3.4 3.4 0 1 1-6.8 0c0-1.7 1.3-3.5 3.4-6.4Z"
      fill="currentColor"
    />
  </svg>
);

export default IconSVG;
