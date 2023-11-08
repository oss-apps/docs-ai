import Image from "next/image"
import { useMemo, useState } from "react"
import hash from "string-hash"
import color from "tinycolor2"
import { z } from "zod";


const HashAvatar: React.FC<{ uid: string, size: number, square?: boolean }> = ({ uid, size, square }) => {
  const n = hash(uid)
  const c1 = color({ h: n % 360, s: 0.95, l: 0.5 })
  const c1_ = c1.toHexString()
  const c2 = c1.triad()[1].toHexString()

  return (
    <svg width={size} height={size} className={square ? "rounded-md shadow-md" : "rounded-full shadow-md"} viewBox="0 0 80 80">
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

const Avatar: React.FC<{ src?: string | null, uid: string, size?: number, square?: boolean, srcIsUid?: boolean }> = ({ src, uid, size = 32, square, srcIsUid }) => {

  const urlSchema = z.string().url().nullable()
  const [error, setError] = useState(false)

  useMemo(() => {
    try {
      urlSchema.parse(src)
    }
    catch (err) {
      console.log("🔥 ~ err:", err)
      srcIsUid = true
      setError(true)
    }

  }, [])

  if (srcIsUid && src) {
    uid = src
  }

  // return <></>

  if (error) {
    return (
      <HashAvatar uid={uid} size={size || 32} square={!!square} />
    )
  }

  return (
    <div>
      {(src && !error) ? (
        <Image className={`shadow-md ${square ? 'rounded-md' : 'rounded-full'}`} alt="profile-pic" src={src} width={size} height={size} onError={() => setError(true)} />
      ) : (
          <HashAvatar uid={uid} size={size || 32} square={!!square} />
      )}
    </div>
  )
}

export default Avatar