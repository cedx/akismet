import assert from 'assert';
import {Blog} from '../src';

/**
 * @test {Blog}
 */
describe('Blog', () => {

  describe('constructor()', () => {
    it('should initialize the existing properties', () => {
      let blog = new Blog({charset: 'UTF-8', language: 'en', url: 'https://github.com/cedx/akismet'});
      assert.equal(blog.charset, 'UTF-8');
      assert.equal(blog.language, 'en');
      assert.equal(blog.url, 'https://github.com/cedx/akismet');
    });

    it('should not create new properties', () =>
      assert(!('foo' in new Blog({foo: 'bar', url: 'https://github.com/cedx/akismet'})))
    );
  });

  /**
   * @test {Blog.fromJSON}
   */
  describe('.fromJSON()', () => {
    it('should return a null reference with a non-object JSON string', () =>
      assert.strictEqual(Blog.fromJSON('foo'), null)
    );

    it('should return an empty instance with an empty JSON object', () => {
      let blog = Blog.fromJSON({});
      assert(!blog.charset.length);
      assert(!blog.language.length);
      assert(!blog.url.length);
    });

    it('should return an initialized instance with a non-empty JSON object', () => {
      let blog = Blog.fromJSON({
        blog: 'https://github.com/cedx/akismet',
        blog_charset: 'UTF-8',
        blog_lang: 'en'
      });

      assert.equal(blog.charset, 'UTF-8');
      assert.equal(blog.language, 'en');
      assert.equal(blog.url, 'https://github.com/cedx/akismet');
    });
  });

  describe('toJSON()', () => {
    it('should return an empty JSON object with a newly created instance', () =>
      assert(!Object.keys(new Blog().toJSON()).length)
    );

    it('should return a non-empty JSON object with a initialized instance', () => {
      let data = new Blog({
        charset: 'UTF-8',
        language: 'en',
        url: 'https://github.com/cedx/akismet'
      }).toJSON();

      assert.equal(data.blog, 'https://github.com/cedx/akismet');
      assert.equal(data.blog_charset, 'UTF-8');
      assert.equal(data.blog_lang, 'en');
    });
  });
});