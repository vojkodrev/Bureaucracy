# Bureaucracy backend

The backend exposes BIRO225 invoices through an English GraphQL API.

```bash
./install.sh
./run-dev.sh
```

Open the GraphQL playground at <http://localhost:8080/> or send requests to
`http://localhost:8080/graphql`.

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
