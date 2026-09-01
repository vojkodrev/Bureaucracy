# Bureaucracy backend

The backend exposes BIRO225 invoices through an English GraphQL API.

```bash
./install.sh
./run-dev.sh
```

Open the GraphQL playground at <http://localhost:8080/> or send requests to
`http://localhost:8080/graphql`.

```graphql
query SearchInvoices($invoiceNumber: String, $customerId: String, $customerName: String, $issuedFrom: Time, $issuedTo: Time) {
  searchInvoices(invoiceNumber: $invoiceNumber, customerId: $customerId, customerName: $customerName, issuedFrom: $issuedFrom, issuedTo: $issuedTo, limit: 20) {
    id
    invoiceNumber
    issueDate
    dueDate
    customerCode
    customerName
    amount
    paidAmount
    currency
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
an inclusive date range. When no filters are supplied, the API returns invoices
up to the requested limit.
Results default to 20 rows and are limited to 100.
