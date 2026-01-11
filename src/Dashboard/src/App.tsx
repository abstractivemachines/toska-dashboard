import { useMemo } from 'react';
import { ConfigProvider } from './context';
import { useHashRouter, createRoute } from './router';
import { Footer, Header, Navigation } from './components/layout';
import { HomePage, ServicePage, TracesPage, TraceDetailPage, ObservabilityPage, NotFoundPage } from './pages';
import './app.css';

// Define routes
const routes = [
  createRoute('/'),
  createRoute('/services/:name'),
  createRoute('/traces'),
  createRoute('/traces/:traceId'),
  createRoute('/observability'),
];

function Router() {
  const { route, params } = useHashRouter(routes);

  // Render the matched route
  const content = useMemo(() => {
    if (!route) {
      return <NotFoundPage />;
    }

    switch (route.path) {
      case '/':
        return <HomePage />;
      case '/services/:name':
        return <ServicePage serviceName={params.name} />;
      case '/traces':
        return <TracesPage />;
      case '/traces/:traceId':
        return <TraceDetailPage traceId={params.traceId} />;
      case '/observability':
        return <ObservabilityPage />;
      default:
        return <NotFoundPage />;
    }
  }, [route, params]);

  return content;
}

export default function App() {
  return (
    <ConfigProvider>
      <div className="app">
        <Header />
        <Navigation />
        <main className="main-content">
          <Router />
        </main>
        <Footer />
      </div>
    </ConfigProvider>
  );
}
