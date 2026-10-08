import { InboxPage } from "./features/inbox/InboxPage";

function App() {
  const organizationId =
    import.meta.env.VITE_ORGANIZATION_ID ??
    "00000000-0000-0000-0000-000000000001";

  return (
    <InboxPage
      organizationId={organizationId}
    />
  );
}

export default App;
