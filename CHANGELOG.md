# Changelog

## [0.6.0] - 2026-11-23

### Added

- Add the `Typography` component.
- Add the `Container` and `Accordion` layouts.
- Add the `useTheme()` hook for accessing the current theme.
- Add density support to `TextField` and `NumberField`.
- Add start alignment support to `DockedToolbar`.
- Add automated tests for the `Theme` and `Typography` components.
- Add an npm publishing workflow triggered by published GitHub releases.

### Changed

- Update components to use the `useTheme()` hook.
- Improve the resize handle styling for panes.
- Remove unused motion styles and other dead code.
- Stabilize the `Theme` context configuration to avoid unnecessary consumer updates.

### Fixed

- Fix vertical pane resizing.
