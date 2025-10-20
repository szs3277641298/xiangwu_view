type ChangeHandler = () => void

class ScreenfullLike {
  private changeHandlers = new Set<ChangeHandler>()
  private isListenerBound = false

  private get doc(): Document | null {
    return typeof document !== 'undefined' ? document : null
  }

  get isEnabled(): boolean {
    const doc = this.doc
    return Boolean(doc && (doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled))
  }

  get isFullscreen(): boolean {
    const doc = this.doc
    if (!doc) return false
    return Boolean(doc.fullscreenElement ?? (doc as any).webkitFullscreenElement)
  }

  private bindListener() {
    if (this.isListenerBound || !this.doc) return
    const doc = this.doc
    if (!doc) return

    const handler = () => {
      this.changeHandlers.forEach(callback => {
        try {
          callback()
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('[screenfull] change handler error:', error)
          }
        }
      })
    }

    doc.addEventListener('fullscreenchange', handler)
    doc.addEventListener('webkitfullscreenchange', handler as EventListener)
    this.isListenerBound = true
  }

  async toggle(element?: HTMLElement | null): Promise<void> {
    const doc = this.doc
    if (!this.isEnabled || !doc) return

    if (this.isFullscreen) {
      await (doc.exitFullscreen?.() ?? (doc as any).webkitExitFullscreen?.())
    } else {
      const target = element ?? doc.documentElement
      await (target.requestFullscreen?.() ?? (target as any).webkitRequestFullscreen?.())
    }
  }

  on(event: 'change', handler: ChangeHandler): void {
    if (event !== 'change') return
    this.changeHandlers.add(handler)
    this.bindListener()
  }

  off(event: 'change', handler: ChangeHandler): void {
    if (event !== 'change') return
    this.changeHandlers.delete(handler)
  }
}

const screenfull = new ScreenfullLike()

export default screenfull
