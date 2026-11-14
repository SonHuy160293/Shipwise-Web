# Add Organization Portfolio as the first feature

Start with agreed product requirements and a published OpenAPI contract. Do not implement a portfolio from assumed DTOs. Create src/features/organizations only when work begins; add pages, components, api, schemas and tests only as needed. Export the page through index.ts. Replace the organizations placeholder route with that public export; preserve the existing shell/providers/client/tokens.

## Page and components

Compose PageContainer and PageHeader, then a feature-specific list/table and loading/error/empty states. Reuse Button, Input and other shadcn primitives. Add a primitive with npx shadcn@latest add component-name and review generated imports/tokens. Add a navigation item in components/layout/navigation.tsx only for genuinely new top-level destinations.

## Form and validation

Use useForm with zodResolver(schema), defaultValues and z.infer types. Compose FormField, FormItem, FormLabel, FormControl, FormDescription and FormMessage. Use handleSubmit and formState.isSubmitting, show mutation errors near the form and disable duplicate submission. See app/dev/form-example.tsx for a locally validated example without a fake API. Keep business forms inside their feature.

## Queries and mutations

Generate contracts first. Define tenant-scoped keys, then useQuery with a queryFn that calls http.get using the documented path and signal. A conceptual pattern is queryFn: ({signal}) => loadPortfolio(tenantId, signal); loadPortfolio must use the actual contract, not a guessed endpoint. Validate uncertain runtime payloads. Use useMutation for writes, retry:false, and invalidate the affected tenant-scoped list/detail keys on success. Do not put query results into another store.

## URL state and tests

Parse search params for filters, sort and pagination; use URL values as the source of truth. Add accessible component tests for user behavior and Playwright coverage for navigation, errors and mobile operation. Mock the HTTP boundary with contract-shaped fixtures only after the real schema exists. Run the complete quality gates; architecture changes should be exceptional, documented decisions.
