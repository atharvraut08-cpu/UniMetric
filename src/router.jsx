import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Each page is its own chunk, fetched on first visit instead of shipping in one big bundle.
const page = (load) => async () => ({ Component: (await load()).default });

const router = createBrowserRouter([
  // Auth page has its own full-screen layout (no Navbar/Footer)
  {
    path: '/auth',
    lazy: page(() => import('./pages/AuthPage')),
  },
  // All other pages use the shared MainLayout shell
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,             lazy: page(() => import('./pages/HomePage'))             },
      { path: 'dashboard',       lazy: page(() => import('./pages/CollegeDashboardPage')) },
      { path: 'college/:id',     lazy: page(() => import('./pages/CollegeDashboardPage')) },
      { path: 'colleges/:id',    lazy: page(() => import('./pages/CollegeDashboardPage')) },
      { path: 'analytics/:id',   lazy: page(() => import('./pages/CollegeDashboardPage')) },
      { path: 'compare',         lazy: page(() => import('./pages/ComparePage'))          },
      { path: 'submit-feedback', lazy: page(() => import('./pages/SubmitFeedbackPage'))   },
      { path: 'admin',           lazy: page(() => import('./pages/AdminDashboardPage'))   },
    ],
  },
]);

export default router;
