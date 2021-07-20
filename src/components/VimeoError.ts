import { vimeoLogString } from './vimeoLogString';

export class VimeoError extends Error {
  constructor(message: string) {
    super(vimeoLogString(message));
  }
}
