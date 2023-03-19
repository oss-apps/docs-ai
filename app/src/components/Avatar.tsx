import Image from "next/image"
import hash from "string-hash"
import color from "tinycolor2"

const HashAvatar: React.FC<{ uid: string, size: number, square?: boolean }> = ({ uid, size, square }) => {
  const n = hash(uid)
  const c1 = color({ h: n % 360, s: 0.95, l: 0.5 })
  const c1_ = c1.toHexString()
  const c2 = c1.triad()[1].toHexString()

  return (
    <svg width={size} height={size} className={square ? "rounded-md" : "rounded-full"} viewBox="0 0 80 80">
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id={uid}>
          <stop stopColor={c1_} offset="0%"></stop>
          <stop stopColor={c2} offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none">
        <rect fill={`url(#${uid})`} x="0" y="0" width="80" height="80" />
      </g>
    </svg>
  )
}

const Avatar: React.FC<{ src?: string | null, uid: string, size?: number, square?: boolean }> = ({ src, uid, size = 32, square }) => {

  return (
    <div>
      {src ? (
        <Image className="rounded-full" alt="profile-pic" src={src} width={size} height={size} />
      ) : (
        <HashAvatar uid={uid} size={size || 32} square={!!square} />
      )}
    </div>
  )
}

export default Avatar