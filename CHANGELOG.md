# Changelog

All notable changes to Podcaster’s Forge will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/),  
and this project follows semantic versioning (MAJOR.MINOR.PATCH).

---

## [v0.1.2] - 2025-09-07
### Added
- `/api/ping` endpoint with timestamp + latency
- UI button for `/api/ping`
- Accessibility improvements: live region + focus styles

### Changed
- Moved inline styles into CSS classes for cleaner markup

---

## [v0.1.1] - 2025-09-07
### Added
- `/api/version` endpoint auto-reads version from `server/package.json`
- UI now shows version string automatically

---

## [v0.1.0] - 2025-09-07
### Added
- Initial working skeleton
- Express backend + static frontend
- `/api/hello` and `/api/health` endpoints
- Repo protections and documentation scaffold
