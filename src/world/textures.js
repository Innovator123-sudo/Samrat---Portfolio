/* ============================================================================
   PROCEDURAL TEXTURES — all original, generated at runtime on <canvas>.
   No external image assets, no network requests, no licensing ambiguity.
   ========================================================================== */

import * as THREE from 'three'
import { SITE } from '../data/content'

const setQuality = (tex, anisotropy = 4) => {
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = anisotropy
  tex.needsUpdate = true
  return tex
}

function fitText(ctx, text, maxWidth, startSize, family, weight = 700) {
  let size = startSize
  while (size > 20) {
    ctx.font = `${weight} ${size}px ${family}`
    if (ctx.measureText(text).width <= maxWidth) return size
    size -= 4
  }
  return size
}

export function makeAsphaltTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#34383a'
  ctx.fillRect(0, 0, 512, 512)

  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  for (let i = 0; i < 4200; i++) {
    const x = rand() * 512
    const y = rand() * 512
    const r = 0.4 + rand() * 2.4
    ctx.fillStyle =
      rand() < 0.5
        ? `rgba(235,225,205,${0.018 + rand() * 0.06})`
        : `rgba(6,8,7,${0.03 + rand() * 0.08})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  /* wheel polish in both lanes */
  const polish = ctx.createLinearGradient(0, 0, 512, 0)
  polish.addColorStop(0, 'rgba(0,0,0,0)')
  polish.addColorStop(0.16, 'rgba(0,0,0,0.12)')
  polish.addColorStop(0.28, 'rgba(255,255,255,0.03)')
  polish.addColorStop(0.42, 'rgba(0,0,0,0)')
  polish.addColorStop(0.66, 'rgba(0,0,0,0.06)')
  polish.addColorStop(0.8, 'rgba(255,255,255,0.025)')
  polish.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = polish
  ctx.fillRect(0, 0, 512, 512)

  /* hairline cracks */
  ctx.strokeStyle = 'rgba(10,12,11,0.22)'
  ctx.lineWidth = 1
  for (let i = 0; i < 7; i++) {
    let x = rand() * 512
    let y = rand() * 512
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let s = 0; s < 6; s++) {
      x += (rand() - 0.5) * 34
      y += rand() * 28
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  /* crisp edge lines */
  ctx.fillStyle = 'rgba(239,234,220,0.78)'
  ctx.fillRect(17, 0, 5, 512)
  ctx.fillRect(490, 0, 5, 512)

  /* dashed centre line, seamless 128px rhythm */
  ctx.fillStyle = 'rgba(238,226,194,0.88)'
  for (let y = -16; y < 512; y += 128) {
    ctx.fillRect(253, y, 6, 72)
  }

  /* faint patched seam */
  ctx.fillStyle = 'rgba(16,18,17,0.18)'
  ctx.fillRect(0, 282, 512, 5)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  return setQuality(tex, 8)
}

export function makeGravelTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#9a8c76'
  ctx.fillRect(0, 0, 256, 256)
  let seed = 19
  const rand = () => {
    seed = (seed * 48271) % 2147483647
    return (seed - 1) / 2147483646
  }
  for (let i = 0; i < 1800; i++) {
    const x = rand() * 256
    const y = rand() * 256
    ctx.fillStyle =
      rand() > 0.5
        ? `rgba(235,226,207,${0.09 + rand() * 0.22})`
        : `rgba(54,50,44,${0.08 + rand() * 0.22})`
    ctx.fillRect(x, y, 1 + rand() * 2.4, 1 + rand() * 2.4)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 16)
  return setQuality(tex, 4)
}

export function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 1, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, 'rgba(255,244,214,0.78)')
  g.addColorStop(0.52, 'rgba(255,201,142,0.2)')
  g.addColorStop(1, 'rgba(255,190,130,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return setQuality(new THREE.CanvasTexture(c))
}

export function makeShadowTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 14, 128, 128, 126)
  g.addColorStop(0, 'rgba(4,8,6,0.7)')
  g.addColorStop(0.44, 'rgba(4,8,6,0.36)')
  g.addColorStop(1, 'rgba(4,8,6,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  return tex
}

/* -------------------------------------------------------------- billboards */
export function makeBillboardTexture(station) {
  const c = document.createElement('canvas')
  c.width = 1400
  c.height = 860
  const ctx = c.getContext('2d')
  const isFinal = !!station.finale
  const ink = isFinal ? '#101720' : '#15241e'
  const paper = isFinal ? '#f5ddc1' : '#f1ebdd'
  const accent = station.accent

  ctx.fillStyle = ink
  ctx.fillRect(0, 0, c.width, c.height)

  /* quiet printing grid */
  ctx.strokeStyle = 'rgba(241,235,221,0.055)'
  ctx.lineWidth = 1
  for (let x = 70; x < c.width; x += 70) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, c.height)
    ctx.stroke()
  }
  for (let y = 70; y < c.height; y += 70) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(c.width, y)
    ctx.stroke()
  }

  /* accent horizon geometry — a road, a sun, a map pin */
  ctx.save()
  ctx.globalAlpha = isFinal ? 0.95 : 0.85
  ctx.strokeStyle = accent
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(1110, 200)
  ctx.bezierCurveTo(980, 300, 1310, 390, 1110, 540)
  ctx.stroke()
  ctx.globalAlpha = 0.23
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(1178, 224, 72, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.arc(1178, 224, 44, 0, Math.PI * 2)
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  /* header */
  ctx.fillStyle = paper
  ctx.font = '500 24px "IBM Plex Mono", monospace'
  ctx.letterSpacing = '3px'
  ctx.fillText(`STOP ${station.index}  /  ${station.boardKicker.toUpperCase()}`, 78, 98)
  ctx.fillStyle = accent
  ctx.fillRect(78, 126, 74, 4)

  /* title */
  ctx.fillStyle = paper
  const title = station.boardTitle
  let size = isFinal ? 230 : 196
  size = fitText(ctx, title, 900, size, '"Fraunces Variable", Georgia, serif', 700)
  ctx.font = `700 ${size}px "Fraunces Variable", Georgia, serif`
  ctx.fillText(title, 72, isFinal ? 390 : 380)

  /* subtitle */
  ctx.fillStyle = 'rgba(241,235,221,0.72)'
  ctx.font = '400 40px "Manrope Variable", sans-serif'
  ctx.fillText(station.boardSub, 80, isFinal ? 468 : 460)

  /* footer prompt */
  ctx.strokeStyle = 'rgba(241,235,221,0.17)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(78, 684)
  ctx.lineTo(1320, 684)
  ctx.stroke()

  ctx.fillStyle = isFinal ? paper : 'rgba(241,235,221,0.68)'
  ctx.font = '500 23px "IBM Plex Mono", monospace'
  ctx.fillText(isFinal ? 'THE ROAD ENDS HERE  ·  ONE SEAT LEFT' : 'CLICK THE SIGN  ·  WANNA HAVE A LOOK?', 78, 742)

  ctx.fillStyle = accent
  ctx.fillRect(78, 790, 330, 2)
  ctx.fillText(SITE.role.toUpperCase(), 78, 824)

  /* right edge marker */
  ctx.save()
  ctx.translate(1330, 756)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = 'rgba(241,235,221,0.45)'
  ctx.font = '500 19px "IBM Plex Mono", monospace'
  ctx.fillText(`SAMRAT / ${new Date().getFullYear()}`, 0, 0)
  ctx.restore()

  if (isFinal) {
    ctx.strokeStyle = accent
    ctx.lineWidth = 9
    ctx.strokeRect(22, 22, c.width - 44, c.height - 44)
  }

  return setQuality(new THREE.CanvasTexture(c), 8)
}

export function makeRouteSignTexture() {
  const c = document.createElement('canvas')
  c.width = 700
  c.height = 420
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#1d3a30'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.strokeStyle = '#eee7d8'
  ctx.lineWidth = 9
  ctx.strokeRect(22, 22, c.width - 44, c.height - 44)
  ctx.fillStyle = '#eee7d8'
  ctx.font = '600 32px "IBM Plex Mono", monospace'
  ctx.fillText('SCENIC ROUTE', 58, 98)
  ctx.font = '700 78px "Fraunces Variable", Georgia, serif'
  ctx.fillText('6 stops', 54, 194)
  ctx.font = '400 30px "Manrope Variable", sans-serif'
  ctx.fillText('one very good conversation', 58, 252)
  ctx.fillStyle = '#d89a62'
  ctx.fillRect(58, 300, 260, 4)
  ctx.font = '500 22px "IBM Plex Mono", monospace'
  ctx.fillStyle = 'rgba(238,231,216,0.74)'
  ctx.fillText('KEEP GOING  →', 58, 354)
  return setQuality(new THREE.CanvasTexture(c), 4)
}
