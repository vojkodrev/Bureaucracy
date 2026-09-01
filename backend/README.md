# Bureaucracy backend

The backend exposes BIRO225 invoices through an English GraphQL API.

```bash
./install.sh
./run-dev.sh
```

Open the GraphQL playground at <http://localhost:8080/> or send requests to
`http://localhost:8080/graphql`.

```graphql
query SearchInvoices($invoiceNumber: String!) {
  searchInvoices(invoiceNumber: $invoiceNumber, limit: 20) {
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

`invoiceNumber` performs a partial, case-insensitive search against the
`BIRO225.dbo.Racuni.Stevilka` column. SQL Server controls case sensitivity via
the database collation. Results default to 20 rows and are limited to 100.
