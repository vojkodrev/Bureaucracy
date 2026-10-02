# Bureaucracy backend

The backend exposes BIRO225 invoices through an English GraphQL API.

```bash
./install.sh
./run-dev.sh
```

Generate the repository-wide development certificate with `../certs/generate.sh`
(or `..\certs\generate.ps1` on Windows), trust `bureaucracy-ca.crt`, and then
open the GraphQL playground at <https://localhost:8080/> or send requests to
`https://localhost:8080/graphql`.

All routes except `GET /health` require a Keycloak access token in the
`Authorization: Bearer <token>` header. Configure the Keycloak issuer and the
allowed public client with `KEYCLOAK_URL`, `KEYCLOAK_REALM`, and
`KEYCLOAK_CLIENT_ID`. The backend verifies the token signature against the
realm JWKS as well as its issuer, expiry, and intended client.
During startup, the backend waits for the realm's signing keys, retrying failed
fetches every two seconds with a five-second timeout per attempt. Keycloak,
the backend, and the frontend can be launched together with `../run-prod.ps1`.

Invoice PDFs are served as inline documents from
`GET /api/invoices/:invoiceNumber/pdf`. The placeholder implementation does
not query the database yet.

```graphql
query SearchInvoices($invoiceNumber: String, $customerId: String, $customerName: String, $issuedFrom: Time, $issuedTo: Time, $page: Int, $pageSize: Int) {
  searchInvoices(invoiceNumber: $invoiceNumber, customerId: $customerId, customerName: $customerName, issuedFrom: $issuedFrom, issuedTo: $issuedTo, page: $page, pageSize: $pageSize) {
    invoices {
      id
      invoiceNumber
      customerName
      amount
      issueDate
    }
    totalCount
    page
    pageSize
    totalPages
  }
}
```

Variables:

```json
{
  "invoiceNumber": "00001"
}
```

`invoiceNumber`, `customerId`, and `customerName` perform partial searches
against the `BIRO225.dbo.Racuni.Stevilka`, `SifraPartnerja`, and `ImePartnerja`
columns. SQL Server controls case sensitivity via the database collation. All
filters are optional. `issuedFrom` and `issuedTo` filter `DatumIzstavitve` using
an inclusive date range. When no filters are supplied, the API returns all
invoices one page at a time. Pages default to 20 rows and are limited to 100.
