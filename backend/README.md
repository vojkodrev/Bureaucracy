# Bureaucracy backend

The backend exposes BIRO225 invoices through an English GraphQL API.

```bash
./install.sh
./run-dev.sh
```

Open the GraphQL playground at <http://localhost:8080/> or send requests to
`http://localhost:8080/graphql`.

```graphql
query SearchInvoices($invoiceNumber: String, $customerId: String, $customerName: String) {
  searchInvoices(invoiceNumber: $invoiceNumber, customerId: $customerId, customerName: $customerName, limit: 20) {
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
filters are optional; when none are supplied, the API returns invoices up to the requested limit.
Results default to 20 rows and are limited to 100.
