import { describe, expect, it } from 'bun:test';
import { formatMarkdown404, prefersMarkdown, withVaryAccept } from './index';

describe('worker / agent content negotiation and 404 utilities', () => {
    describe('prefersMarkdown', () => {
        it('returns true when Accept is text/markdown', () => {
            expect(prefersMarkdown('text/markdown')).toBe(true);
        });

        it('returns true when Accept contains text/markdown with equal or higher quality than text/html', () => {
            expect(prefersMarkdown('text/markdown, text/html, */*')).toBe(true);
            expect(prefersMarkdown('text/markdown;q=1.0, text/html;q=0.9')).toBe(true);
        });

        it('returns false for standard browser Accept headers preferring text/html', () => {
            expect(prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')).toBe(false);
            expect(prefersMarkdown('text/html;q=1.0, text/markdown;q=0.5')).toBe(false);
        });

        it('returns false for null, empty or unrelated accept headers', () => {
            expect(prefersMarkdown(null)).toBe(false);
            expect(prefersMarkdown('')).toBe(false);
            expect(prefersMarkdown('application/json')).toBe(false);
        });
    });

    describe('formatMarkdown404', () => {
        it('includes 404 error explanation with at least 20 characters and links to sitemaps and llms.txt', () => {
            const body = formatMarkdown404('/__ora-404-probe-sgodsm42');
            expect(body.length).toBeGreaterThan(20);
            expect(body).toContain('# 404 Not Found');
            expect(body).toContain('/__ora-404-probe-sgodsm42');
            expect(body).toContain('https://alwaisy.dev/sitemap-index.xml');
            expect(body).toContain('https://alwaisy.dev/llms.txt');
        });
    });

    describe('withVaryAccept', () => {
        it('adds Vary: Accept to response headers without removing existing headers', () => {
            const initial = new Response('test body', {
                headers: {
                    'Content-Type': 'text/html'
                }
            });
            const modified = withVaryAccept(initial);
            expect(modified.headers.get('Vary')).toBe('Accept');
            expect(modified.headers.get('Content-Type')).toBe('text/html');
        });

        it('appends Accept to existing Vary header if not present', () => {
            const initial = new Response('test body', {
                headers: {
                    Vary: 'Origin'
                }
            });
            const modified = withVaryAccept(initial);
            expect(modified.headers.get('Vary')).toBe('Origin, Accept');
        });
    });
});
