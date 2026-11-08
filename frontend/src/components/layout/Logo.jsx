/** Isotipo de Buen Clima (sol detrás de una nube). */
export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="16" fill="#13244d" />
      <circle cx="38" cy="25" r="11" fill="#ffb547" />
      <g stroke="#ffb547" strokeWidth="3" strokeLinecap="round">
        <path d="M38 7v4M52 11l-3 3M56 25h-4M24 11l3 3" />
      </g>
      <path d="M20 50h25a9 9 0 0 0 0-18 12 12 0 0 0-23 3.5A7.5 7.5 0 0 0 20 50z" fill="#7cc4ff" />
    </svg>
  );
}
