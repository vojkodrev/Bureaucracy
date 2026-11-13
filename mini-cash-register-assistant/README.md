# Mini Cash Register Assistant

A Chrome extension for assisting with VKR invoice reporting in Mini Blagajna.

## Load locally

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder.

The content script is loaded only on `https://miniblagajna.fu.gov.si/`.
Click the extension icon in the Chrome toolbar to open the Import VKR popup.

## Configuration

Backend and Keycloak URLs are kept in `config.js`. When either host changes, also
update the matching `host_permissions` entries in `manifest.json`.

The extension uses the dedicated `mini-cash-register-assistant` public Keycloak
client from `keycloak/realm-export.json`. Its stable Chrome extension ID is
`lhcfgooaihegnbmbececacnlfhmabgaf`.
