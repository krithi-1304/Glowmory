export function Wordmark() {
  return (
    <svg className="wordmark" viewBox="0 0 620 100" aria-hidden="true">
      <defs>
        <linearGradient id="letter-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff9e9" />
          <stop offset=".42" stopColor="#f9e4b7" />
          <stop offset=".6" stopColor="#bd8b53" />
          <stop offset=".76" stopColor="#f6dfad" />
          <stop offset="1" stopColor="#e4b876" />
        </linearGradient>
        <linearGradient id="letter-light">
          <stop stopColor="#fff9db" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff9db" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff9db" stopOpacity="0" />
        </linearGradient>
        <text id="letter-shape" x="310" y="73" textAnchor="middle">GLOWMORY</text>
        <clipPath id="letter-clip"><use href="#letter-shape" /></clipPath>
      </defs>
      <use href="#letter-shape" transform="translate(0 4)" fill="#6e483e" stroke="#6e483e" strokeWidth="1.3" />
      <use href="#letter-shape" transform="translate(0 2)" fill="#b78657" stroke="#b78657" strokeWidth="1" />
      <use href="#letter-shape" fill="url(#letter-gold)" stroke="#ffefca" strokeWidth=".35" />
      <g clipPath="url(#letter-clip)"><rect className="wordmark-sweep" x="-100" width="100" height="100" fill="url(#letter-light)" /></g>
      <ellipse className="wordmark-firefly" cx="28" cy="65" rx="2" ry="1.5" fill="#ffe5a0" />
    </svg>
  );
}
