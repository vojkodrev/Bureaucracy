# Bureaucracy backend

The backend exposes BIRO225 invoices through an English GraphQL API.

```bash
./install.sh
./run-dev.sh
```

Open the GraphQL playground at <http://localhost:8080/> or send requests to
`http://localhost:8080/graphql`.

```graphql
query SearchInvoices($invoiceNumber: String, $customerId: String) {
  searchInvoices(invoiceNumber: $invoiceNumber, customerId: $customerId, limit: 20) {
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

`invoiceNumber` and `customerId` perform partial searches against the
`BIRO225.dbo.Racuni.Stevilka` and `SifraPartnerja` columns. SQL Server controls
case sensitivity via the database collation. Both filters are optional; when
neither is supplied, the API returns invoices up to the requested limit.
Results default to 20 rows and are limited to 100.
