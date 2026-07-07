// scripts/optimize-images.mjs
// Redimensiona e recomprime PNGs de ícones/mascote pro tamanho real de
// exibição no app (eles hoje saem de arte em 1000px+ e pesam 1-2MB cada,
// mas em tela nunca passam de ~84px pros ícones e ~170px pros mascotes).
// Roda com: node scripts/optimize-images.mjs
import { readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import sharp from 'sharp'

const ASSETS_DIR = join(import.meta.dirname, '..', 'src', 'assets')

// [pasta relativa a src/assets, maior lado em px]
// Ícones: maior uso real encontrado no código foi 84px (mercadocarrinho) -> 192 dá folga de retina (2x+).
// Mascotes/logo (arquivos soltos na raiz de assets/): maior uso real foi 170px -> 360 dá folga de retina.
const TARGETS = [
  { dir: join(ASSETS_DIR, 'icons'), maxSize: 192, recursive: true },
  { dir: ASSETS_DIR, maxSize: 360, recursive: false },
]

function listPngs(dir, recursive) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (recursive) out.push(...listPngs(full, recursive))
      continue
    }
    if (extname(entry).toLowerCase() === '.png') out.push(full)
  }
  return out
}

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`
}

async function optimize(file, maxSize) {
  const before = statSync(file).size
  const buffer = await sharp(file)
    .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
    .png({ palette: true, quality: 80, compressionLevel: 9, effort: 10 })
    .toBuffer()

  // Se por algum motivo a versão paletizada ficar maior (imagem já pequena
  // e com muitas cores), mantém o arquivo original em vez de piorar.
  if (buffer.length >= before) return { before, after: before, skipped: true }

  const { writeFileSync } = await import('node:fs')
  writeFileSync(file, buffer)
  return { before, after: buffer.length, skipped: false }
}

async function main() {
  const seen = new Set()
  let totalBefore = 0
  let totalAfter = 0

  for (const { dir, maxSize, recursive } of TARGETS) {
    const files = listPngs(dir, recursive)
    for (const file of files) {
      if (seen.has(file)) continue
      seen.add(file)
      const { before, after, skipped } = await optimize(file, maxSize)
      totalBefore += before
      totalAfter += after
      const rel = file.slice(ASSETS_DIR.length + 1)
      const pct = before > 0 ? (100 - (after / before) * 100).toFixed(0) : 0
      console.log(
        skipped
          ? `-  ${rel} mantido (${fmtKB(before)}, já otimizado)`
          : `OK ${rel}: ${fmtKB(before)} -> ${fmtKB(after)} (-${pct}%)`
      )
    }
  }

  console.log('')
  console.log(`Total: ${fmtKB(totalBefore)} -> ${fmtKB(totalAfter)} (-${(100 - (totalAfter / totalBefore) * 100).toFixed(1)}%)`)
}

main()
