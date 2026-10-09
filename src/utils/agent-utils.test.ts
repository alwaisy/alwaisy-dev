import { describe, expect, it } from 'bun:test';
import { formatMarkdown404, prefersMarkdown, withAgentDiscoveryLinkHeaders, withVaryAccept } from './agent-utils';

describe('agent content negotiation and 404 utilities', () => {
    describe('prefersMarkdown', () => {
        it('returns true when Accept is text/markdown', () => {
            expect(prefersMarkdown('text/markdown')).toBe(true);
            expect(prefersMarkdown('text/markdown, text/html;q=0.9')).toBe(true);
        });

        it('returns true when Accept contains text/markdown with equal or higher quality than text/html', () => {
            expect(prefersMarkdown('text/markdown;q=1.0, text/html;q=0.8')).toBe(true);
            expect(prefersMarkdown('text/markdown, */*')).toBe(true);
        });

        it('returns false for standard browser Accept headers preferring text/html', () => {
            expect(
                prefersMarkdown(
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
                )
            ).toBe(false);
            expect(prefersMarkdown('text/html')).toBe(false);
        });

        it('returns false for null, empty or unrelated accept headers', () => {
            expect(prefersMarkdown(null)).toBe(false);
            expect(prefersMarkdown('')).toBe(false);
            expect(prefersMarkdown('application/json')).toBe(false);
        });
    });

    describe('formatMarkdown404', () => {
        it('includes 404 error explanation with at least 20 characters and links to sitemaps and llms.txt', () => {
            const body = formatMarkdown404('/some-test-missing-path');
            expect(body.length).toBeGreaterThan(20);
            expect(body).toContain('404 Not Found');
            expect(body).toContain('/some-test-missing-path');
            expect(body).toContain('https://alwaisy.dev/sitemap-index.xml');
            expect(body).toContain('https://alwaisy.dev/llms.txt');
        });
    });

    describe('withVaryAccept', () => {
        it('adds Vary: Accept to response headers without removing existing headers', () => {
            const headers = new Headers({ 'Content-Type': 'text/html' });
            withVaryAccept(headers);
            expect(headers.get('Vary')).toBe('Accept');
            expect(headers.get('Content-Type')).toBe('text/html');
        });

        it('appends Accept to existing Vary header if not present', () => {
            const headers = new Headers({ Vary: 'Encoding' });
            withVaryAccept(headers);
            expect(headers.get('Vary')).toContain('Accept');
            expect(headers.get('Vary')).toContain('Encoding');
        });
    });

    describe('withAgentDiscoveryLinkHeaders', () => {
        it('sets Link header pointing to api-catalog, service-doc, ai-catalog, and describedby', () => {
            const headers = new Headers();
            withAgentDiscoveryLinkHeaders(headers);
            const link = headers.get('Link');
            expect(link).toContain('rel="api-catalog"');
            expect(link).toContain('rel="service-doc"');
            expect(link).toContain('rel="ai-catalog"');
            expect(link).toContain('rel="describedby"');
        });
    });
});
