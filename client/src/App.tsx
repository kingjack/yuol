import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import Articles from "./pages/Articles";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";
import HeartVoices from "./pages/HeartVoices";
import HeartVoiceDetail from "./pages/HeartVoiceDetail";
import ArticleEditor from "./pages/ArticleEditor";
import ArticleDetail from "./pages/ArticleDetail";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/posts" component={Posts} />
      <Route path="/posts/:id" component={PostDetail} />
      <Route path="/articles" component={Articles} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/search" component={Search} />
      <Route path="/heart-voices" component={HeartVoices} />
      <Route path="/heart-voices/:id" component={HeartVoiceDetail} />
      <Route path="/articles/new" component={ArticleEditor} />
      <Route path="/articles/:id" component={ArticleDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
