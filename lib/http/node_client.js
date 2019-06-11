import EventEmitter from 'events';
import fetch from 'node-fetch';
import {packageVersion} from '../version.g.js';
import {ClientConstructor, ClientPrototype} from './client.js';
import {ClientError} from './error.js';
import {RequestEvent, ResponseEvent} from './events.js';

/**
 * Defines the options of a {@link NodeClient} instance.
 * @typedef {object} ClientOptions
 * @property {URL} [endPoint] The URL of the API end point.
 * @property {boolean} [isTest] Value indicating whether the client operates in test mode.
 * @property {string} [userAgent] The user agent string to use when making requests.
 */

/** Submits comments to the {@link https://akismet.com|Akismet} service. */
export class NodeClient extends EventEmitter {

  /**
   * Creates a new client.
   * @param {string} apiKey The Akismet API key.
   * @param {Blog} blog The front page or home URL of the instance making requests.
   * @param {ClientOptions} [options] An object specifying values used to initialize this instance.
   */
  constructor(apiKey, blog, options = {}) {
    super();

    const {
      endPoint = new URL('https://rest.akismet.com/1.1/'),
      isTest = false,
      userAgent = `Node.js/${process.version.substring(1)} | Akismet/${packageVersion}`
    } = options;

    /**
     * The Akismet API key.
     * @type {string}
     */
    this.apiKey = apiKey;

    /**
     * The front page or home URL of the instance making requests.
     * @type {Blog}
     */
    this.blog = blog;

    /**
     * The URL of the API end point.
     * @type {URL}
     */
    this.endPoint = endPoint;

    /**
     * Value indicating whether the client operates in test mode.
     * @type {boolean}
     */
    this.isTest = isTest;

    /**
     * The user agent string to use when making requests.
     * @type {string}
     */
    this.userAgent = userAgent;
  }

  /**
   * Queries the service by posting the specified fields to a given end point, and returns the response as a string.
   * @param {URL} endPoint The URL of the end point to query.
   * @param {object} fields The fields describing the query body.
   * @return {Promise<string>} The response as string.
   * @private
   */
  async _fetch(endPoint, fields) {
    const body = new URLSearchParams({...this.blog.toJSON(), ...fields});
    if (this.isTest) body.set('is_test', '1');

    const request = new fetch.Request(endPoint.href, {
      body,
      headers: {'content-type': 'application/x-www-form-urlencoded', 'user-agent': this.userAgent},
      method: 'POST'
    });

    this.emit(NodeClient.eventRequest, new RequestEvent(request));

    let response;
    try { response = await fetch(request); }
    catch (err) { throw new ClientError(err.message, endPoint); }

    this.emit(NodeClient.eventResponse, new ResponseEvent(response, request));

    if (!response.ok) throw new ClientError('An error occurred while querying the end point', endPoint);
    if (response.headers.has('x-akismet-debug-help')) throw new ClientError(response.headers.get('x-akismet-debug-help'), endPoint);
    return response.text();
  }
}

// Apply the client mixins.
Object.assign(NodeClient, ClientConstructor);
Object.assign(NodeClient.prototype, ClientPrototype);