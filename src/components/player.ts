import VimeoVideo, { VimeoVideoArgs } from './vimeo-video'
import API from './api'
import EventEmitter from 'event-emitter-es6'
import VideoQuality from './video-quality';

type PlayerArgs = VimeoVideoArgs & {
  autoload?: boolean;
};

/** A class that represents a Vimeo video player */
export default class Player extends EventEmitter {
  id: number;
  video: VimeoVideo;
  texture?: VimeoVideo['texture'];
  /**
   * @constructor Create a new Vimeo video player
   * @param {number} videoId - A Vimeo video ID (e.g 296928206)
   * @param {Object} args - An object that holds the Vimeo video properties
   * @param {number} [args.quality = VideoQuality.auto] - args.quality - The video quality represented by the VideoQuality enum
   * @param {bool} [args.muted = false] - A boolean for loading a video and playing it back muted
   * @param {bool} [args.autoplay = true] - A boolean for loading the video and automatically playing it once it has loaded
   * @param {bool} [args.loop = true] - A boolean for looping the video playback when it reaches the end
   */
  constructor (videoId: string | number, args: PlayerArgs = {}) {
    super()

    if (!videoId) {
      throw new Error('[Vimeo] Video ID is required')
    }

    this.id = this.parseVideoId(videoId)
    this.video = new VimeoVideo(this.id, args)
    this.bindEvents()

    if (args.autoload) {
      this.load()
    }
  }

  /**
   * Load a Vimeo album and create multipule Vimeo Players
   * @param {number} albumId - A Vimeo album ID (e.g 5528679)
   * @param {Object} args - An object that holds the Vimeo video properties
   * @param {number} [args.quality = VideoQuality.auto] - args.quality - The video quality represented by the VideoQuality enum
   * @param {bool} [args.muted = false] - A boolean for loading a video and playing it back muted
   * @param {bool} [args.autoplay = true] - A boolean for loading the video and automatically playing it once it has loaded
   * @param {bool} [args.loop = true] - A boolean for looping the video playback when it reaches the end
   */
  static loadPlayersByAlbum (albumId: number, args: PlayerArgs = {}) {
    let players: Player[] = []

    return new Promise<Player[]>((resolve, reject) => {
      API.getAlbumVideos(albumId).then(resp => {
        for (let i = 0; i < resp.data.length; i++) {
          let player = new Player(resp.data[i].uri, args)
          player.video.data = resp.data[i]
          players.push(player)
        }

        resolve(players)
      }, reject)
    })
  }

  /** Bind all player event emitters, used internally */
  bindEvents () {
    this.video.on('metadataLoad', () => {
      this.emit('metadataLoad')
    })

    this.video.on('videoLoad', (videoTexture) => {
      this.texture = this.video.texture
      this.emit('videoLoad', videoTexture)
    })

    this.video.on('play', () => {
      this.emit('play')
    })
  }

  /**
   * Parse and clean a valid Vimeo video ID from string or integer
   * @param {number} id - The Vimeo video ID
   * @returns {number}
   */
  parseVideoId (id: number | string): number {
    return parseInt((id.toString().match(/([0-9]+)/) || ['',''])[1])
  }

  /**
   * Get the current player's Vimeo video ID
   * @returns {number}
   */
  getVideoId (): number {
    return this.id
  }

  /**
   * Get the JSON metadata object stored in the Vimeo video description
   * @returns {object} - The metadata JSON object parsed from the Vimeo video description
   */
  getMetadata (): unknown | undefined {
    if (this.video) {
      return this.video.getJSONFromVideoDescription()
    } else {
      console.warn('[Vimeo] No video is loaded but you are trying to get the metadata')
    }
    return;
  }

  /**
   * Get the Vimeo video description
   * @returns {string} - The video description
   */
  getDescription (): string | undefined {
    if (this.video) {
      return this.video.data?.description
    } else {
      console.warn('[Vimeo] No video is loaded but you are trying to get the description')
    }
    return;
  }

  /** Mute the video */
  mute () {
    this.video.mute()
  }

  /** Unmute the video */
  unmute () {
    this.video.unmute()
  }

  /** Load the current video */
  load () {
    this.video.load()
  }

  /**
   * Set the video quality based on one of the options in the VideoQuality enum
   * @param {VideoQuality} quality - The desired quality setting
   */
  setQuality (quality: VideoQuality) {
    this.video.selectedQuality = quality
  }

  /**
   * Get the current selected video quality
   * @returns {number}
   */
  getQuality (): VideoQuality {
    return this.video.selectedQuality
  }

  /**
   * Get the current video's width in pixels
   * @returns {number}
   */
  getWidth (): number {
    return this.video.getWidth() || 0
  }

  /**
   * Get the current video's height in pixels
   * @returns {number}
   */
  getHeight (): number {
    return this.video.getHeight() || 0
  }

  /**
   * Query wheter the current video is playing
   * @returns {bool}
   */
  isPlaying (): boolean | undefined {
    return this.video.isPlaying()
  }

  /**
   * Query wheter a video is paused
   * @returns {bool}
   */
  isPaused (): boolean | undefined {
    return this.video.isPaused()
  }

  /**
   * Query wheter a video is stopped
   * @returns {bool}
   */
  isStopped (): boolean | undefined {
    return this.video.isStopped()
  }

  /**
   * Query the video current time
   * @returns {number}
   */
  getTime (): number | undefined {
    return this.video.getTime()
  }

  /**
   * Set the video current time
   * @param {number} time - the time to set the current video to
   */
  setTime (time: number): void {
    this.video.setTime(time)
  }

  /** Play the video */
  play () {
    if (this.video) {
      try {
        this.video.play()
      } catch (error) {
        throw new Error('[Vimeo] Video provided is not correct, try changing the video id and running the code again')
      }
    } else {
      console.warn('[Vimeo] Video has not been loaded yet, try calling player.load()')
    }
  }

  /** Pause the video */
  pause () {
    if (this.video) {
      try {
        this.video.pause()
      } catch (error) {
        throw new Error('[Vimeo] Video provided is not correct, try changing the video id and running the code again')
      }
    }
  }

  /** Stop the video */
  stop () {
    if (this.video) {
      try {
        this.video.stop()
      } catch (error) {
        throw new Error('[Vimeo] Video provided is not correct, try changing the video id and running the code again')
      }
    }
  }

  /**
   * Set the video volume
   * @param {number} volume - A number for the new volume you would like to set between 0.0 and 1.0
   */
  setVolume (volume: number) {
    if (this.video) {
      this.video.setVolume(volume)
    }
  }
}
