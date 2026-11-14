# Mobile architecture

The app uses a feature-first structure. Keep UI, orchestration, server calls, and
contracts separate so each layer can be tested or replaced independently.

```text
src/
  api/                 Axios client, API errors, and React Query client
  app/                 Root providers and application bootstrap
  config/              Environment configuration
  features/
    <feature>/
      api/              Feature-specific request functions when needed
      components/       Components used only by this feature
      controllers/      Screen state and orchestration hooks
      interfaces/       View props and feature-only contracts
      screens/          Thin route entry points
      views/            Presentational UI
  hooks/api/            Reusable React Query hooks
  interfaces/           Shared API and domain contracts
  redux/                Global client state only
  ui/                   Reusable design-system components
```

## Screen flow

A screen must remain thin. It calls one controller and passes its result to a
view:

```tsx
export function CheckoutScreen() {
  const controller = useCheckoutController()
  return <CheckoutView {...controller} />
}
```

The controller owns screen state, navigation, mutations, and data composition.
It may call React Query hooks, Redux hooks, or temporary legacy stores. The view
only receives values and callbacks through typed props.

```text
CheckoutScreen
  -> useCheckoutController
       -> useGetCheckout / useSubmitCheckout
       -> Redux (only when state is truly global client state)
  -> CheckoutView
```

## State ownership

- React Query owns server state: API data, loading, errors, caching, refetching,
  and mutations.
- Redux owns cross-feature client state such as the signed-in profile and plan
  feature flags.
- Formik owns form state; Yup owns form validation.
- Local component state owns temporary UI state such as an open sheet or the
  selected tab.
- Views must not call Axios, React Query, Redux, or navigation directly.

## API conventions

- Use the shared `apiClient`; do not create Axios instances inside features.
- Put shared response contracts in `src/interfaces`.
- Give every query a stable query-key factory.
- Return the response `data` payload from query functions, not the entire Axios
  response.
- Normalize request errors before presenting them to a view.
- Invalidate the relevant query keys after a successful mutation.

The Events feature is the first migrated example of the Screen -> Controller ->
View pattern. Other legacy screens can be moved incrementally without changing
their routes or user-facing behavior.

## Authentication session

Authentication follows the same dependency direction as other server-backed
features:

```text
Login View / Formik
  -> Login Controller
  -> Login Mutation Hook
  -> Auth Service
  -> Auth Repository
  -> API Client
  -> Session Coordinator
```

The session coordinator is the only owner allowed to establish, restore, or
terminate a session. It coordinates the typed credential store, in-memory API
credential, Redux session/profile projections, and React Query identity
boundary. Navigation switches declaratively between the authentication and
application trees after bootstrap resolves.

The current backend contract provides an opaque access token but no confirmed
refresh, `/me`, revoke, or server-logout contract. Those capabilities remain
unsupported until their endpoints and lifecycle semantics are supplied; the
client must not infer them from the token.

The access token currently uses a versioned, environment-scoped AsyncStorage
adapter because that compatibility storage was already approved for this
project and no secure-storage dependency has been approved. Passwords are
never persisted or placed in Redux/React Query. Keychain/Keystore remains the
production hardening target; migration ownership and timing must be assigned
during the mobile security review before release.
