import React from "react"

type IconProps = {
  className?: string,
  primaryClassName?: string,
  secondaryClassName?: string,
}

export const IconCollection: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <rect width="20" height="12" x="2" y="10" className={primaryClassName ?? 'fill-zinc-400'} rx="2" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M20 8H4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2zm-2-4H6c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export const IconChat: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M20.3 12.04l1.01 3a1 1 0 0 1-1.26 1.27l-3.01-1a7 7 0 1 1 3.27-3.27zM11 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M15.88 17.8a7 7 0 0 1-8.92 2.5l-3 1.01a1 1 0 0 1-1.27-1.26l1-3.01A6.97 6.97 0 0 1 5 9.1a9 9 0 0 0 10.88 8.7z" />
    </svg>
  )
}

export const IconSettings: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M6.8 3.45c.87-.52 1.82-.92 2.83-1.17a2.5 2.5 0 0 0 4.74 0c1.01.25 1.96.65 2.82 1.17a2.5 2.5 0 0 0 3.36 3.36c.52.86.92 1.8 1.17 2.82a2.5 2.5 0 0 0 0 4.74c-.25 1.01-.65 1.96-1.17 2.82a2.5 2.5 0 0 0-3.36 3.36c-.86.52-1.8.92-2.82 1.17a2.5 2.5 0 0 0-4.74 0c-1.01-.25-1.96-.65-2.82-1.17a2.5 2.5 0 0 0-3.36-3.36 9.94 9.94 0 0 1-1.17-2.82 2.5 2.5 0 0 0 0-4.74c.25-1.01.65-1.96 1.17-2.82a2.5 2.5 0 0 0 3.36-3.36zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <circle cx="12" cy="12" r="2" className={secondaryClassName ?? 'fill-zinc-900'} />
    </svg>
  )
}

export const IconWidget: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M5 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4c0-1.1.9-2 2-2zm10 0h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4c0-1.1.9-2 2-2zM5 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2z" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M18 6h2a1 1 0 0 1 0 2h-2v2a1 1 0 0 1-2 0V8h-2a1 1 0 0 1 0-2h2V4a1 1 0 0 1 2 0v2z" />
    </svg>
  )
}

export const IconCode: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M18,21H6c-1.657,0-3-1.343-3-3V7h18v11C21,19.657,19.657,21,18,21z" ></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M21,7H3V6c0-1.657,1.343-3,3-3h12c1.657,0,3,1.343,3,3V7z"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M11.001,19c-0.081,0-0.162-0.009-0.244-0.03c-0.536-0.134-0.861-0.677-0.728-1.213l2-8c0.134-0.536,0.679-0.86,1.213-0.728	c0.536,0.134,0.861,0.677,0.728,1.213l-2,8C11.856,18.697,11.449,19,11.001,19z"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M16,17c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414L16.586,14l-1.293-1.293	c-0.391-0.391-0.391-1.023,0-1.414s1.023-0.391,1.414,0l2,2c0.391,0.391,0.391,1.023,0,1.414l-2,2C16.512,16.902,16.256,17,16,17z"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M8,17c-0.256,0-0.512-0.098-0.707-0.293l-2-2c-0.391-0.391-0.391-1.023,0-1.414l2-2c0.391-0.391,1.023-0.391,1.414,0	s0.391,1.023,0,1.414L7.414,14l1.293,1.293c0.391,0.391,0.391,1.023,0,1.414C8.512,16.902,8.256,17,8,17z"></path>
    </svg>
  )
}

export const IconLockOpen: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M18,21H6c-1.657,0-3-1.343-3-3v-8c0-1.657,1.343-3,3-3h12c1.657,0,3,1.343,3,3v8	C21,19.657,19.657,21,18,21z" ></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M12,12c-1.105,0-2,0.895-2,2s0.895,2,2,2s2-0.895,2-2S13.105,12,12,12z"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M15.986,4.014l0.08-0.08c0.375-0.375,0.376-0.995-0.015-1.354C14.984,1.6,13.563,1,12,1C8.686,1,6,3.686,6,7h2	c0-2.209,1.791-4,4-4c1.02,0,1.949,0.384,2.654,1.013C15.042,4.359,15.618,4.382,15.986,4.014z"></path>
    </svg>
  )
}

export const IconSearch: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <circle cx="10" cy="10" r="7" className={primaryClassName ?? 'fill-zinc-400'} />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
    </svg>
  )
}

export const IconPieChart: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M14 13h6.78a1 1 0 0 1 .97 1.22A10 10 0 1 1 9.78 2.25a1 1 0 0 1 1.22.97V10a3 3 0 0 0 3 3z" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M20.78 11H14a1 1 0 0 1-1-1V3.22a1 1 0 0 1 1.22-.97c3.74.85 6.68 3.79 7.53 7.53a1 1 0 0 1-.97 1.22z" />
    </svg>
  )
}

export const IconDashboard: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M3 11h2a1 1 0 0 1 0 2H3v-2zm3.34-6.07l1.42 1.41a1 1 0 0 1-1.42 1.42L4.93 6.34l1.41-1.41zM13 3v2a1 1 0 0 1-2 0V3h2zm6.07 3.34l-1.41 1.42a1 1 0 1 1-1.42-1.42l1.42-1.41 1.41 1.41zM21 13h-2a1 1 0 0 1 0-2h2v2z" />
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm-6.93-6h13.86a8 8 0 1 0-13.86 0z" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M11 14.27V9a1 1 0 0 1 2 0v5.27a2 2 0 1 1-2 0z" />
    </svg>
  )
}

export const IconChatHistory: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <rect width="16" height="13" x="2" y="2" className={secondaryClassName ?? 'fill-zinc-900'} rx="2" />
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M6 16V8c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v13a1 1 0 0 1-1.7.7L16.58 18H8a2 2 0 0 1-2-2z" />
    </svg>
  )
}

export const IconPaintBrush: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M13 14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1v-1.4a3 3 0 0 1 2.35-2.92l5.87-1.3A1 1 0 0 0 20 7.4V7a1 1 0 0 0-1-1h-1V4h1a3 3 0 0 1 3 3v.4a3 3 0 0 1-2.35 2.92l-5.87 1.3a1 1 0 0 0-.78.98V14z" />
      <rect width="17" height="6" x="2" y="2" className={primaryClassName ?? 'fill-zinc-400'} rx="2" />
    </svg>
  )
}

export const IconFolderOpen: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <g>
        <path className={secondaryClassName ?? 'fill-zinc-900'} d="M22 10H2V6c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v2z" />
        <rect width="20" height="12" x="2" y="8" className={primaryClassName ?? 'fill-zinc-400'} rx="2" />
      </g>
    </svg>
  )
}

export const IconBot: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M6.657,22.308L5.901,19.99	c-1.612-0.052-2.901-1.369-2.901-2.991V8.001c0-1.657,1.345-3.003,3.003-3.003h11.998c1.657,0,3,1.345,3,3.003v8.998	c0,1.657-1.343,3-3,3h-7.083l-2.589,2.692C7.803,23.235,6.889,23.026,6.657,22.308z"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} fillRule="evenodd" d="M9.001,10.001	c0.552,0,1,0.448,1,1.001c0,0.552-0.448,1-1,1c-0.552,0-1-0.448-1-1C8.001,10.449,8.449,10.001,9.001,10.001z" clipRule="evenodd"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} fillRule="evenodd" d="M15.001,10.001	c0.552,0,1,0.448,1,1.001c0,0.552-0.448,1-1,1c-0.552,0-1-0.448-1-1C14.001,10.449,14.449,10.001,15.001,10.001z" clipRule="evenodd"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} fillRule="evenodd" d="M13.506,13.999h-3.005	c-0.276,0-0.5,0.225-0.5,0.501c0,0.043,0.004,0.083,0.012,0.113c0.192,0.916,1.012,1.387,1.993,1.387	c0.981,0,1.796-0.471,1.988-1.387c0.008-0.031,0.012-0.071,0.012-0.113C14.006,14.225,13.782,13.999,13.506,13.999z" clipRule="evenodd"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} fillRule="evenodd" d="M11.002,5V1.992c0-0.551,0.448-1,1-1	c0.551,0,1,0.449,1,1V5H11.002z" clipRule="evenodd"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} fillRule="evenodd" d="M9.991,2c0-0.551,0.448-1,1-1h2.021	c0.551,0,1,0.449,1,1c0,0.552-0.449,1-1,1h-2.021C10.439,3,9.991,2.552,9.991,2z" clipRule="evenodd"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} fillRule="evenodd" d="M1.002,14.005v-3.012	c0-0.548,0.447-0.995,0.995-0.995h1.005v5.001H1.997C1.449,14.999,1.002,14.553,1.002,14.005z" clipRule="evenodd"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} fillRule="evenodd" d="M22.999,14.005v-3.012	c0-0.548-0.447-0.995-0.995-0.995h-1.005v5.001h1.005C22.553,14.999,22.999,14.553,22.999,14.005z" clipRule="evenodd"></path>
    </svg>
  )
}

export const IconSend: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <g fill="none" transform="translate(1 2)">
        <path className={secondaryClassName ?? 'fill-zinc-900'} d="M12 1v15.97l-1 1.12-8.6 1.82a1 1 0 0 1-1.3-1.36l9-18A.99.99 0 0 1 11 0l1 1z" />
        <path className={primaryClassName ?? 'fill-zinc-400'} d="M11 0c.36 0 .71.18.9.55l9 18a1 1 0 0 1-1.3 1.36L11 18.1V0z" />
      </g>
    </svg>
  )
}

export const IconEmbed: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'} >
        <path className={secondaryClassName ?? 'fill-zinc-900'} d="M10.501,21c-0.097,0-0.196-0.01-0.295-0.03c-0.812-0.162-1.339-0.953-1.177-1.765l3-15c0.162-0.812,0.951-1.343,1.765-1.177    c0.812,0.162,1.339,0.953,1.177,1.765l-3,15C11.828,20.507,11.202,21,10.501,21z"></path>
        <path className={primaryClassName ?? 'fill-zinc-400'} d="M19.499,18c-0.286,0-0.575-0.082-0.831-0.252c-0.689-0.459-0.875-1.391-0.416-2.08L20.697,12    l-2.445-3.668c-0.459-0.689-0.273-1.621,0.416-2.08c0.689-0.46,1.62-0.273,2.08,0.416l3,4.5c0.336,0.504,0.336,1.16,0,1.664l-3,4.5    C20.459,17.766,19.983,18,19.499,18z" ></path>
        <path className={primaryClassName ?? 'fill-zinc-400'} d="M4.501,18c-0.485,0-0.96-0.234-1.25-0.668l-3-4.5c-0.336-0.504-0.336-1.16,0-1.664l3-4.5    c0.459-0.689,1.39-0.876,2.08-0.416c0.689,0.459,0.875,1.391,0.416,2.08L3.303,12l2.445,3.668c0.459,0.689,0.273,1.621-0.416,2.08    C5.076,17.918,4.787,18,4.501,18z" ></path>
      </svg>
    </>
  )
}

export const IconShare: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
        <path className={primaryClassName ?? 'fill-zinc-400'} d="M18,8h-2v3h1.5c0.3,0,0.5,0.2,0.5,0.5v7c0,0.3-0.2,0.5-0.5,0.5h-11C6.2,19,6,18.8,6,18.5v-7    C6,11.2,6.2,11,6.5,11H8V8H6c-1.7,0-3,1.3-3,3v8c0,1.7,1.3,3,3,3h12c1.7,0,3-1.3,3-3v-8C21,9.3,19.7,8,18,8z" ></path>
        <path className={secondaryClassName ?? 'fill-zinc-900'} d="M15.3,6c0.6,0,0.9-0.7,0.5-1.2l-2.9-2.9c-0.5-0.5-1.3-0.5-1.8,0L8.2,4.8C7.8,5.3,8.1,6,8.7,6H15.3z"></path>
        <path d="M14,15V5h-4v10c0,0.6,0.4,1,1,1h2C13.6,16,14,15.6,14,15z"></path>
      </svg>
    </>
  )
}

export const IconCustomize: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
        <path className={primaryClassName ?? 'fill-zinc-400'} d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2zm11 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path className={secondaryClassName ?? 'fill-zinc-900'} d="M9.73 14H17a1 1 0 0 1 0 2H9.73a2 2 0 0 0 0-2zm4.54-6a2 2 0 0 0 0 2H7a1 1 0 1 1 0-2h7.27z" /></svg>
    </>
  )
}

export const IconAdd: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
        <circle cx="12" cy="12" r="10" className={primaryClassName ?? 'fill-zinc-400'} />
        <path className={secondaryClassName ?? 'fill-zinc-900'} d="M13 11h4a1 1 0 0 1 0 2h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V7a1 1 0 0 1 2 0v4z" />
      </svg>
    </>
  )
}

export const IconWebsite: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <circle className={primaryClassName ?? 'fill-zinc-400'} cx="12" cy="12" r="10"></circle>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M14,21.763v-4.04C13.397,19.178,12.626,20,12,20c-1.137,0-2.751-2.697-2.972-7H14v-0.264c0-0.662,0.246-1.262,0.64-1.736	H9.028C9.249,6.697,10.863,4,12,4c1.109,0,2.666,2.567,2.949,6.682C15.431,10.263,16.053,10,16.74,10	c0.051,0,0.099,0.012,0.149,0.015C16.7,7.99,16.242,6.204,15.56,4.846c2.342,1.171,4.031,3.452,4.37,6.154h-1.064l2.941,2.941	C21.932,13.313,22,12.664,22,12c0-5.514-4.486-10-10-10S2,6.486,2,12s4.486,10,10,10c0.686,0,1.356-0.07,2.004-0.202	C14.003,21.786,14,21.775,14,21.763z M4.069,13h2.954c0.111,2.442,0.624,4.577,1.416,6.154C6.097,17.983,4.409,15.701,4.069,13z M7.024,11H4.069c0.339-2.701,2.028-4.983,4.37-6.154C7.648,6.423,7.134,8.558,7.024,11z"></path>
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M23.55,18.513l-6.296-6.296C16.792,11.754,16,12.082,16,12.736v9.027c0,0.598,0.662,0.957,1.164,0.633l1.86-1.205 l1.146,2.232c0.268,0.522,0.909,0.728,1.431,0.46h0c0.522-0.268,0.728-0.909,0.46-1.431l-1.127-2.191l2.241-0.478 C23.759,19.658,23.973,18.935,23.55,18.513z"></path>
    </svg>
  )
}

export const IconHistory: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M6.55 6.14l1.16 1.15A1 1 0 0 1 7 9H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1.7-.7l1.44 1.42A10 10 0 1 1 2 12a1 1 0 0 1 2 0 8 8 0 1 0 2.55-5.86z" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M15.7 14.3a1 1 0 0 1-1.4 1.4l-3-3a1 1 0 0 1-.3-.7V7a1 1 0 0 1 2 0v4.59l2.7 2.7z" />
    </svg>
  )
}
export const IconLogOut: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M11 4h3a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V6h-2v12h2v-2a1 1 0 0 1 2 0v3a1 1 0 0 1-1 1h-3v1a1 1 0 0 1-1.27.96l-6.98-2A1 1 0 0 1 2 19V5a1 1 0 0 1 .75-.97l6.98-2A1 1 0 0 1 11 3v1z" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M18.59 11l-1.3-1.3c-.94-.94.47-2.35 1.42-1.4l3 3a1 1 0 0 1 0 1.4l-3 3c-.95.95-2.36-.46-1.42-1.4l1.3-1.3H14a1 1 0 0 1 0-2h4.59z" /></svg>
  )
}

export const IconNewProject: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <g>
        <path className={primaryClassName ?? 'fill-zinc-900'} d="M22 10H2V6c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v2z" />
        <rect width="20" height="12" x="2" y="8" className={secondaryClassName ?? 'fill-zinc-400'} rx="2" />
        <path className={primaryClassName ?? 'fill-zinc-900'} d="M13 13h2a1 1 0 0 1 0 2h-2v2a1 1 0 0 1-2 0v-2H9a1 1 0 0 1 0-2h2v-2a1 1 0 0 1 2 0v2z" />
      </g>
    </svg>
  )
}




export const IconBack: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <circle cx="12" cy="12" r="10" className={primaryClassName ?? 'fill-zinc-400'} />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M13.7 15.3a1 1 0 0 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4 1.4L10.42 12l3.3 3.3z" /></svg>
  )
}

export const IconUpdate: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M8 4a1 1 0 0 1-1 1H5v10h2a2 2 0 0 1 2 2c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h2V5h-2a1 1 0 0 1 0-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h2a1 1 0 0 1 1 1z" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M11 6.41V13a1 1 0 0 0 2 0V6.41l1.3 1.3a1 1 0 0 0 1.4-1.42l-3-3a1 1 0 0 0-1.4 0l-3 3a1 1 0 0 0 1.4 1.42L11 6.4z" /></svg>
  )
}


export const IconClear: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={secondaryClassName ?? 'fill-zinc-900'} fillRule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z" />
    </svg>
  )
}

export const IconDownload: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M15 15v-3a3 3 0 0 0-6 0v3H6a4 4 0 0 1-.99-7.88 5.5 5.5 0 0 1 10.86-.82A4.49 4.49 0 0 1 22 10.5a4.5 4.5 0 0 1-4.5 4.5H15z" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M11 18.59V12a1 1 0 0 1 2 0v6.59l1.3-1.3a1 1 0 0 1 1.4 1.42l-3 3a1 1 0 0 1-1.4 0l-3-3a1 1 0 0 1 1.4-1.42l1.3 1.3z" /></svg>
  )
}


export const IconThumb: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"
      className={className ?? "w-6 h-6"} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
  )
}

export const IconFeedback: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className ?? 'w-6 h-6'}>
      <path className={primaryClassName ?? 'fill-zinc-400'} d="M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2zm3 7a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2H8zm0 4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2H8z" />
      <path className={secondaryClassName ?? 'fill-zinc-900'} d="M15 4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6c0-1.1.9-2 2-2 0-1.1.9-2 2-2h2a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export const IconEmail: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={className ?? 'w-6 h-6'}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline></svg>)
}

export const IconLink: React.FC<IconProps> = ({ className, primaryClassName, secondaryClassName }) => {

  return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className ?? 'w-5 h-5'}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>)
}