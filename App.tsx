import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/layouts/layout";
import Dashboard from "./pages/dashboard";
import Assessment from "./pages/assessment";
import CareerPaths from "./pages/career-paths";
import Roadmap from "./pages/roadmap";
import Resources from "./pages/resources";
import Progress from "./pages/progress";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/career-paths" component={CareerPaths} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/resources" component={Resources} />
      <Route path="/progress" component={Progress} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
