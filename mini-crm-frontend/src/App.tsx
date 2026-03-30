import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";     
import { Layout } from "./components/layout/Layout";
import { CustomersPage } from "./pages/CustomersPage";
import { CustomerDetailPage } from "./pages/CustomerDetailPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { MachinesPage } from "./pages/MachinesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Toaster position="bottom-right" />
          <Routes>
            <Route path="/" element={<Navigate to="/customers" replace />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/machines" element={<MachinesPage />} /> 
          </Routes>
        </Layout>
              </BrowserRouter>
    </QueryClientProvider>
  );
}
