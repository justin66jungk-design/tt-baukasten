import { PingPong } from '@phosphor-icons/react'

/* macOS-App-Icon: Squircle-Kachel mit Verlauf und Glanzkante */
export function AppIcon({ size = 36 }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.235,
        background: 'linear-gradient(180deg, #41d168 0%, #28b34e 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 0.5px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.18)',
      }}
      aria-hidden
    >
      <PingPong size={size * 0.58} weight="fill" color="white" />
    </div>
  )
}
