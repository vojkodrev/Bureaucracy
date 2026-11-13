# Local HTTPS certificates

Run `./generate.sh` on macOS/Linux or `./generate.ps1` on Windows to create a
local CA and a server certificate for `localhost`, `drevi-pc`, `127.0.0.1`, and
`::1`. The generated keys and certificates are local files and are ignored by
Git.

Import `bureaucracy-ca.crt` into the trusted root certificate store on every
machine/browser that opens the application. Never distribute or commit
`bureaucracy-ca.key` or `bureaucracy.key`.
