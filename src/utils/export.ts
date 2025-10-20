import html2canvas from 'html2canvas'

export async function exportAsImage(element: HTMLElement, filename = `bigscreen-${Date.now()}.png`) {
  const canvas = await html2canvas(element, {
    backgroundColor: '#0B1222',
    scale: window.devicePixelRatio || 1,
    useCORS: true
  })

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = filename
  link.click()
}
