import { useState } from "react";
import { StoreProvider, useStore } from "./store";
import type { View } from "./types";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import CustomerList from "./components/CustomerList";
import CustomerDetail from "./components/CustomerDetail";
import Portal from "./components/Portal";
import { Toasts } from "./components/ui";

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const [view, setView] = useState<View>({ name: "list" });
  const { customers } = useStore();

  const defaultCustomerId =
    customers.find((c) => c.portal?.status === "activated")?.id ||
    customers[0]?.id;

  if (view.name === "portal") {
    return (
      <>
        <Portal
          id={view.id}
          initialTab={view.tab || "dashboard"}
          onExit={() => setView({ name: "detail", id: view.id })}
        />
        <Toasts />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar onNavigate={() => setView({ name: "list" })} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onSwitchToCustomer={() => {
            if (defaultCustomerId) {
              setView({ name: "portal", id: defaultCustomerId });
            }
          }}
        />
        <main className="nice-scroll flex-1 overflow-y-auto px-7 py-6">
          {view.name === "list" ? (
            <CustomerList onOpen={(id) => setView({ name: "detail", id })} />
          ) : (
            <CustomerDetail
              id={view.id}
              onBack={() => setView({ name: "list" })}
              onOpenPortal={() => setView({ name: "portal", id: view.id })}
            />
          )}
        </main>
      </div>
      <Toasts />
    </div>
  );
}
