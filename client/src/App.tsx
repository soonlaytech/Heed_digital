import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";

import Graph from "./Graph";
import ComparisonTable from "./ComparisonTable";

import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import CheckIn from "@/pages/CheckIn";
import Chat from "@/pages/Chat";
import Goals from "@/pages/Goals";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />

      <Route path="/home">
        <>
          <Home />
          <Navigation />
        </>
      </Route>

      <Route path="/signin">
        <SignIn />
      </Route>

      <Route path="/check-in">
        <>
          <CheckIn />
          <Navigation />
        </>
      </Route>

      <Route path="/chat">
        <>
          <Chat />
          <Navigation />
        </>
      </Route>

      <Route path="/goals">
        <>
          <Goals />
          <Navigation />
        </>
      </Route>

      <Route path="/settings">
        <>
          <Settings />
          <Navigation />
        </>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
