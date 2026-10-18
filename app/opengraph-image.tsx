import { ImageResponse } from 'next/og';
import { DEFAULTS } from '@/lib/defaults';

export const alt = DEFAULTS.clubName;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #05060a 0%, #0b1226 60%, #1a1140 100%)',
          color: '#e8ecf5',
        }}
      >
        <div style={{ fontSize: 28, color: '#22d3ee', letterSpacing: 6 }}>ARTIFICIAL INTELLIGENCE · MACHINE LEARNING</div>
        <div style={{ fontSize: 112, fontWeight: 700, marginTop: 24 }}>{DEFAULTS.clubName}</div>
        <div style={{ fontSize: 34, color: '#9aa4b8', marginTop: 16 }}>{DEFAULTS.tagline}</div>
      </div>
    ),
    size,
  );
}
