import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="LearnFlow Logo"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      <text
        x="10"
        y="35"
        fontFamily="Poppins, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        Learn
      </text>
      <text
        x="105"
        y="35"
        fontFamily="Poppins, sans-serif"
        fontSize="30"
        fontWeight="normal"
        fill="hsl(var(--accent))"
      >
        Flow
      </text>
    </svg>
  );
}
