/** Stacked Arc mark, knocked out — no cream/gray plate. Hanging c is in the viewBox. */
export function ArcStackedMark({ size = 240 }: { size?: number }) {
  const height = Math.round(size * (280 / 256));
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 256 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', background: 'transparent' }}
    >
      <path
        fill="#466C7E"
        fillRule="evenodd"
        d="M66 9L74 9L90 13L102 20L105 19L105 13L107 11L141 10L141 117L108 117L105 116L106 108L104 105L102 105L93 112L82 117L69 119L57 118L40 112L33 107L23 96L18 87L14 74L14 56L17 45L26 30L38 19L49 13L65 10Z
           M74 40L88 41L94 44L102 54L104 61L103 72L100 78L93 86L92 85L81 90L75 89L64 84L56 74L54 62L57 51L64 44L73 41Z"
      />
      <path
        fill="#C96845"
        d="M179 6L195 11L211 22L224 36L236 58L239 72L239 95L236 113L229 135L222 135L220 133L214 133L212 131L203 130L201 128L191 127L148 115L178 7Z"
      />
      <path
        fill="#B1853D"
        d="M79 122L102 123L110 126L118 133L106 141L92 157L81 153L72 153L61 158L56 164L53 173L53 235L50 237L16 236L16 125L52 124L54 128L53 133L56 134L63 128L78 123Z"
      />
      <path
        fill="#204334"
        d="M153 130L178 130L204 139L226 157L237 173L204 193L199 184L186 173L177 170L162 170L150 175L137 189L134 196L133 206L138 221L146 230L155 236L175 241L169 277L156 276L134 270L123 265L110 256L97 242L92 234L86 219L84 208L84 196L88 179L95 165L102 156L121 141L136 134L152 131Z"
      />
    </svg>
  );
}
