# Field Test Checklist

Use this before any real-world pilot on phones outdoors.

## Devices
- Test on at least 1 iPhone and 1 Android phone.
- Test once on mobile data and once on public Wi-Fi.
- Test camera permissions from a fresh browser session.

## Core User Journey
- Open the site from a QR code or short link.
- Create a fresh account.
- Log in again after a page reload.
- Open the map and verify markers line up with the real location.
- Scan a valid QR code in daylight.
- Scan the same QR code twice and confirm duplicate handling is clear.
- Open the unlocked location screen.
- Reload the page and confirm progress is still saved.
- Walk to a second location and repeat.

## Edge Cases
- Deny camera permission once and verify the recovery message.
- Lose network during a scan and confirm the user sees a useful error.
- Refresh the page while on the scan screen.
- Open the app with low battery mode enabled.
- Test bright sunlight glare and poor camera focus.

## Admin / Operations
- Export locations before the event.
- Create a SQLite backup before the event.
- Confirm admin is hidden in public mode.
- Verify scan counts increase after a real scan.

## Go / No-Go
- No blocker on login.
- No blocker on QR scanning.
- No blocker on location persistence.
- Map marker positions verified for all public locations.
