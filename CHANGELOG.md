# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added
- Initial release of @studiozandra/svelte-ai-chat-widget
- Svelte 5 runes-based reactive state management
- Server-Sent Events (SSE) streaming support for real-time AI responses
- Customizable themes (light/dark presets + custom CSS variables)
- Internationalization support via i18n props
- Session persistence with localStorage
- Context injection for passing user/page data to backend
- Markdown rendering with code highlighting
- Keyboard navigation (Escape to close, Enter to send)
- Responsive design for mobile and desktop
- Header and footer slots for customization
- Event callbacks (onopen, onclose, onmessage)
- TypeScript support with full type definitions
- Comprehensive documentation with backend implementation examples
- Security best practices following OWASP guidelines
- Zero runtime dependencies (Svelte 5 peer dependency only)

### Security
- Input sanitization for XSS prevention
- No secrets bundled in package
- Automated npm audit on install
- Package integrity verification with publint

### Author
- Zandra Kubota (studiozandra)

[1.0.0]: https://github.com/studiozandra/svelte-ai-chat-widget/releases/tag/v1.0.0
