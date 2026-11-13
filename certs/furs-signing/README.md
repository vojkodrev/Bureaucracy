# FURS signing certificates

Store the certificate material used to sign fiscal-verification requests to
FURS in this directory. Certificate and private-key files are ignored by Git
and must not be committed.

Configure the backend with `FURS_CERTIFICATE_FILE` and
`FURS_CERTIFICATE_PASSWORD`. The path may point to a `.p12`/PKCS#12 file in
this directory. Also configure the tax number, operator tax number, business
premise ID, and electronic device ID listed in `backend/.env.example`.
