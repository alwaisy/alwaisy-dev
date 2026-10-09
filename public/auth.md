# auth.md - Agent Registration and Authentication

This document outlines the authentication and programmatic registration model for automated agents and AI crawlers interacting with https://alwaisy.dev.

## 1. Audience & Scope

alwaisy.dev is an editorial publication, portfolio, and case study archive tracking solo product founders building from zero to $1k MRR.

- **Public Content:** All articles, case studies, LLM archives (`/llms.txt`, `/llms-full.txt`), and capability catalogs (`/.well-known/ai-catalog.json`, `/.well-known/api-catalog`) are freely accessible without authentication.
- **Protected Resources:** Management, submission, and feedback APIs are protected by OAuth 2.0 / OpenID Connect tokens issued by the authorization server.

## 2. Discovery Endpoints

- **OAuth Protected Resource Metadata (RFC 9728):** `https://alwaisy.dev/.well-known/oauth-protected-resource`
- **OAuth Authorization Server Metadata (RFC 8414):** `https://alwaisy.dev/.well-known/oauth-authorization-server`
- **OpenID Connect Discovery:** `https://alwaisy.dev/.well-known/openid-configuration`
- **API Catalog (RFC 9727):** `https://alwaisy.dev/.well-known/api-catalog`
- **MCP Server Card (SEP-1649):** `https://alwaisy.dev/.well-known/mcp/server-card.json`
- **Agent Skills Discovery Index:** `https://alwaisy.dev/.well-known/agent-skills/index.json`
- **ARD Capability Manifest:** `https://alwaisy.dev/.well-known/ai-catalog.json`

## 3. Agent Authentication Methods

Agents may authenticate requests to protected endpoints using standard HTTP `Authorization: Bearer <token>` headers.

Supported flows:
1. **Anonymous Read:** No credential required for public GET endpoints and LLM feeds.
2. **Client Credentials:** For authorized automated partner agents and ingestion pipelines.
3. **Identity Assertion:** Tokens validated against the authorization server specified in `/.well-known/oauth-protected-resource`.

## 4. Contact & Editorial Verification

For editorial inquiries, story submissions, or registering partner agent credentials, contact Awais Alwaisy at `hello@alwaisy.dev` or visit `https://alwaisy.dev/contact`.
