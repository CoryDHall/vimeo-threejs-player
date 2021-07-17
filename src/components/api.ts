/* global fetch */

import { VimeoAPIResponse } from "./types";

const ApiPath = '/vimeo/api';

/** A static class that interfaces with the server-side Vimeo API */
export default class API {
  /**
   * A util method to modify the endpoint to and return a full API request url
   * @param {string} endpoint - The endpoint you would like to add the full request URL (e.g /videos/video-id)
   * @returns {string}
   */
  static path (endpoint: string): string {
    return `${ApiPath}?path=${endpoint}?fields=uri,play,width,height,live,description,title`;
  }

  /**
   * A method for requesting Vimeo videos by video id
   * @param {number} videoId - The Vimeo video id you would like to query (e.g 296928206)
   * @returns {Promise}
   */
  static getVideo(videoId: number): Promise<VimeoAPIResponse> {

    return new Promise<VimeoAPIResponse>((resolve, reject) => {
      fetch(API.path(`/videos/${videoId}`)).then(res => {
        API.sendResponse(res, resolve, reject);
      });
    });
  }

  /**
   * A method for requesting Vimeo albums by album id
   * @param {number} albumId - The Vimeo album id you would like to query (e.g 5528679)
   * @returns {Promise}
   */
  static getAlbumVideos(albumId: number): Promise<{ data: VimeoAPIResponse[]; }> {
    return new Promise<{ data: VimeoAPIResponse[] }>((resolve, reject) => {
      fetch(API.path(`/albums/${albumId}/videos`)).then(res => {
        API.sendResponse(res, resolve, reject);
      });
    });
  }

  /**
   * A utility method for unpacking and resolving the Vimeo API response from the server
   * @param {Object} res - Vimeo API response
   * @param {function(any)} resolve - Promise resolve method
   * @param {function(any)} reject - Promise reject method
   */
  static sendResponse<ReturnType, ErrorType>(res: Response, resolve: (value: ReturnType) => void, reject: (value: ErrorType) => void) {
    res.json().then(json => {
      if (res.status === 200) {
        resolve(json as ReturnType);
      } else {
        reject(json as ErrorType);
      }
    });
  }
}
