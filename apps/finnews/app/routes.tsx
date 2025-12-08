import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./app.tsx'),
  route('ticker-sync', './routes/TickerSync.tsx'),
] satisfies RouteConfig;
