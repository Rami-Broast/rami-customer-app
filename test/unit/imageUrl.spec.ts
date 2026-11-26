import { resolveImageUrl } from '../../src/util/imageUrl';

const BASE = 'https://rami-api-xxxx.run.app/api/v1';

describe('resolveImageUrl', () => {
  it('resolves an uploaded /assets path against the API base', () => {
    expect(resolveImageUrl('/assets/abc123', BASE)).toBe(
      'https://rami-api-xxxx.run.app/api/v1/assets/abc123',
    );
  });

  it('passes an absolute http(s) URL through untouched', () => {
    expect(resolveImageUrl('https://cdn.example.com/x.png', BASE)).toBe(
      'https://cdn.example.com/x.png',
    );
  });

  it('passes a protocol-relative URL through untouched', () => {
    expect(resolveImageUrl('//cdn.example.com/x.png', BASE)).toBe('//cdn.example.com/x.png');
  });

  it('passes a data URI through untouched', () => {
    expect(resolveImageUrl('data:image/png;base64,AAAA', BASE)).toBe('data:image/png;base64,AAAA');
  });

  it('returns null for empty, whitespace, null or undefined', () => {
    expect(resolveImageUrl('', BASE)).toBeNull();
    expect(resolveImageUrl('   ', BASE)).toBeNull();
    expect(resolveImageUrl(null, BASE)).toBeNull();
    expect(resolveImageUrl(undefined, BASE)).toBeNull();
  });

  it('does not double a slash between base and path', () => {
    expect(resolveImageUrl('/assets/x', 'https://h/api/v1/')).toBe('https://h/api/v1/assets/x');
  });
});
