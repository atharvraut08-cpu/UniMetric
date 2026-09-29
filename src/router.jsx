import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CollegeDashboardPage from './pages/CollegeDashboardPage';
import ComparePage from './pages/ComparePage';
import SubmitFeedbackPage from './pages/SubmitFeedbackPage';
import AuthPage from './pages/AuthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const router = createBrowserRouter([
  // Auth page has its own full-screen layout (no Navbar/Footer)
  {
    path: '/auth',
    element: <AuthPage />,
  },
  // All other pages use the shared MainLayout shell
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,             element: <HomePage />             },
      { path: 'dashboard',       element: <CollegeDashboardPage /> },
      { path: 'college/:id',     element: <CollegeDashboardPage /> },
      { path: 'compare',         element: <ComparePage />          },
      { path: 'submit-feedback', element: <SubmitFeedbackPage />   },
      { path: 'admin',           element: <AdminDashboardPage />   },
    ],
  },
]);

export default router;
