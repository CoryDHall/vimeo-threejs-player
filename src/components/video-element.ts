import Util from './util'
import dashjs from 'dashjs'
import EventEmitter from 'event-emitter-es6'
import VimeoVideo from './vimeo-video'

/** Class representing a DOM video element */

type VideoDashElement = {
  player: dashjs.MediaPlayerClass;
  _isDashPlayback: true;
}
type VideoHTMLElement = {
  player: HTMLVideoElement;
  _isDashPlayback: false;
}
type P = dashjs.MediaPlayerClass | HTMLVideoElement;
export default class VideoElement extends EventEmitter {
  domElement: HTMLVideoElement;
  player?: HTMLVideoElement;
  _isDashPlayback: boolean;
  private isDashPlayback(): this is VideoDashElement {
    return this._isDashPlayback;
  }
  private isNotDashPlayback(): this is VideoHTMLElement {
    return this._isDashPlayback;
  }
  /**
   * Create a DOM video element instace
   * @param {VimeoVideo} vimeoVideo - A VimeoVideo object representing the video resource
   */
  constructor (vimeoVideo: VimeoVideo) {
    super()

    this.domElement = this.createElement(vimeoVideo)
    this.domElement.addEventListener('loadeddata', () => {
      if (this.domElement.readyState >= 2) {
        if (vimeoVideo.autoplay) {
          vimeoVideo.play()
        }
        this.emit('videoLoad')
      }
    })
    this._isDashPlayback = vimeoVideo.isDashPlayback();
    (this as {player: P}).player = this.createAdaptivePlayer(vimeoVideo);
  }

  /**
   * Get the <video> element
   * @returns {HTMLElement}
   */
  getElement (): HTMLVideoElement | undefined {
    if (this.domElement) {
      return this.domElement
    }
    return;
  }

  /** Play the video */
  play () {
    if (this.player) {
      try {
        this.player.play()
      } catch (error) {
        this.emit('error', error)
        throw new Error('[Vimeo] Failed triggering playback, try initializing the element with a valid video before hitting play')
      }
    }
  }

  /** Pause the video */
  pause () {
    if (this.player) {
      try {
        this.player.pause()
      } catch (error) {
        this.emit('error', error)
        throw new Error('[Vimeo] Failed triggering playback, try initializing the element with a valid video before hitting pause')
      }
    }
  }

  /** Stop the video */
  stop () {
    if (this.player) {
      this.player.pause()
      if (this.isDashPlayback()) {
        this.player.seek(0.0)
      } else {
        this.player.currentTime = 0.0
      }
    }
  }

  /**
   * Set the video volume
   * @param {number} volume - A number for the new volume you would like to set between 0.0 and 1.0
   */
  setVolume (volume: number) {
    if (this.player) {
      this.domElement.muted = volume === 0;
      if (volume >= 0.0 && volume <= 1.0) {
        if (this.isDashPlayback()) {
          this.player.setVolume(volume)
        } else {
          this.player.volume = volume
        }
      }
    }
  }

  /**
   * Gets the video volume
   */
  getVolume (): number | undefined {
    if (this.player) {
      if (this.isDashPlayback()) {
        return this.player.getVolume()
      } else {
        return this.player.volume
      }
    }
    return;
  }

  /**
   * Query wheter a video is playing
   */
  isPlaying (): boolean | never {
    if (this.player) {
      if (this.isDashPlayback()) {
        return !this.player.isPaused()
      } else {
        return !this.player.paused
      }
    } else {
      throw new Error('[Vimeo] A video has not been loaded yet')
    }
  }

  /**
   * Query wheter a video is paused
   */
  isPaused (): boolean | undefined {
    if (this.player) {
      if (this.isDashPlayback()) {
        return this.player.isPaused()
      } else {
        return this.player.paused
      }
    }
    return
  }

  /**
   * Query wheter a video is stopped
   */
  isStopped (): boolean | undefined {
    if (this.player) {
      return this.isPaused() && this.getTime() === 0
    }
    return
  }

  /**
   * Set the current video time
   * @param {number} time - The time to set the video
   */
  setTime (time: number) {
    if (this.player) {
      if (this.isDashPlayback()) {
        this.player.seek(time)
      } else {
        this.player.currentTime = time
      }
    }
  }

  /**
   * Query the current video time
   */
  getTime (): number | undefined {
    if (this.player) {
      if (this.isDashPlayback()) {
        return this.player.time()
      } else {
        return this.player.currentTime
      }
    }
    return;
  }

  /**
   * Create the <video> element based on the properties provided in the VimeoVideo
   * @param {VimeoVideo} vimeoVideo - A VimeoVideo object representing the video resource
   * @returns {HTMLElement}
   */
  createElement (vimeoVideo: VimeoVideo): HTMLVideoElement {
    let domElement = document.createElement('video')
    domElement.id = 'vimeo-webgl-player-' + vimeoVideo.id
    domElement.crossOrigin = 'anonymous'
    domElement.setAttribute('crossorigin', 'anonymous')
    domElement.muted = vimeoVideo.muted
    domElement.autoplay = vimeoVideo.autoplay
    domElement.loop = vimeoVideo.loop
    // vimeoVideo.muted && domElement.setAttribute('muted', '')

    return domElement
  }

  /**
   * Creates a new DOM element with either Dash, HLS or progressive video playback based on the platform support
   * @param {VimeoVideo} vimeoVideo - A VimeoVideo object representing the video resource
   * @returns {HTMLElement}
   */
  createAdaptivePlayer (vimeoVideo: VimeoVideo): P {
    let player: P

    if (vimeoVideo.isDashPlayback()) {
      player = dashjs.MediaPlayer().create()
      player.initialize(this.domElement, vimeoVideo.getAdaptiveURL(), vimeoVideo.autoplay)
    } else {
      player = this.domElement

      if (Util.isiOS()) {
        this.setiOSPlayerAttributes(player)
      }

      player.src = vimeoVideo.getFileURL() ?? '';
      player.load()
    }

    return player
  }

  /**
   * Adds iOS attributes to be able to play <video> tag inline
   * @param {HTMLElement} vimeoVideo - A <video> element that needs to be configured to play on iOS
   */
  setiOSPlayerAttributes (videoElement: { setAttribute: (arg0: string, arg1: string) => void }) {
    videoElement.setAttribute('webkit-playsinline', '')
    videoElement.setAttribute('playsinline', '')
  }
}
