import { useEffect, useState } from 'react'

const CINE  = ['C','I','N','E']
const VERSE = ['V','E','R','S','E']

export default function LoadingScreen({ onDone }) {
  const [active, setActive] = useState(false)
  const [exit,   setExit]   = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setActive(true), 60)
    const t2 = setTimeout(() => setExit(true),   2500)
    const t3 = setTimeout(() => onDone(),         3100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div className={`ls${exit ? ' ls--exit' : ''}`} aria-hidden="true">
      <div className={`ls__inner${active ? ' ls__inner--in' : ''}`}>

        {/* Spinning film reel */}
        <div className="ls__reel">
          <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="34" stroke="rgba(229,9,20,0.2)"  strokeWidth="1.5"/>
            <circle cx="36" cy="36" r="22" stroke="rgba(229,9,20,0.35)" strokeWidth="1.5"/>
            <circle cx="36" cy="36" r="7"  fill="#e50914" opacity="0.9"/>
            {[0,60,120,180,240,300].map(deg => {
              const rad = (deg * Math.PI) / 180
              return (
                <circle
                  key={deg}
                  cx={36 + 28 * Math.cos(rad)}
                  cy={36 + 28 * Math.sin(rad)}
                  r="4.5"
                  fill="rgba(229,9,20,0.55)"
                />
              )
            })}
            {/* Inner sprocket holes */}
            {[30,90,150,210,270,330].map(deg => {
              const rad = (deg * Math.PI) / 180
              return (
                <circle
                  key={'i'+deg}
                  cx={36 + 15 * Math.cos(rad)}
                  cy={36 + 15 * Math.sin(rad)}
                  r="2.5"
                  fill="rgba(229,9,20,0.3)"
                />
              )
            })}
          </svg>
        </div>

        {/* Logo — letter by letter */}
        <div className="ls__logo">
          {CINE.map((ch, i) => (
            <span
              key={'c'+i}
              className="ls__ch"
              style={{ '--d': `${i * 80}ms` }}
            >{ch}</span>
          ))}
          {VERSE.map((ch, i) => (
            <span
              key={'v'+i}
              className="ls__ch ls__ch--red"
              style={{ '--d': `${(i + 4) * 80}ms` }}
            >{ch}</span>
          ))}
        </div>

        {/* Animated underline */}
        <div className="ls__rule" />

        {/* Tagline */}
        <p className="ls__sub">Your Universe of Cinema</p>

        {/* Progress bar */}
        <div className="ls__track">
          <div className="ls__fill" />
        </div>

      </div>
    </div>
  )
}
