
    export interface VimeoDimensioned {
      height: number
      width: number
    }
    export interface VimeoPlayObj {
      link: string
      link_expiration_time: string
      log: string
    }
    export interface VimeoPlayerObjExt {
      type: string
      codec: string
      created_time: string
      md5: string
      fps: number
      size: number
    }
    export type ProgressiveObj = VimeoDimensioned & VimeoPlayObj & VimeoPlayerObjExt;

interface PlayObject {
  dash: VimeoPlayObj;
  hls: VimeoPlayObj;
  progressive: ProgressiveObj[];
  status?: 'playable' | 'streaming';
}

    export type VimeoAPIResponse = VimeoDimensioned & {
      uri: string;
      description: string;
      play: PlayObject;
      live?: PlayObject;
    };
