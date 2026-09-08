import { InboxPage } from "./features/inbox/InboxPage";

function App() {
  const organizationId = "a31e59c9-22e0-4a82-9ce1-aa6c9813a5da";

  return (
    <InboxPage
      organizationId={organizationId}
    />
  );
}

export default App;