import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

/**
 * Returns all colleges. Normalizes paginated responses ({ results: [...] }) or direct arrays.
 * @returns {Promise<Array>} Array of college objects
 */
export async function getColleges() {
  try {
    const res = await axios.get(`${API_BASE_URL}/colleges/`);
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && Array.isArray(data.colleges)) return data.colleges;
    return [];
  } catch (error) {
    console.error('API Error [getColleges]: Failed to fetch colleges from backend:', error);
    throw error;
  }
}

// Alias for convenience across components
export const fetchColleges = getColleges;

/**
 * Returns all programs, optionally filtered by college_id.
 * @param {string|number} [collegeId]
 * @returns {Promise<Array>} Array of program objects
 */
export async function getPrograms(collegeId) {
  try {
    const res = await axios.get(`${API_BASE_URL}/programs/`, {
      params: collegeId ? { college_id: collegeId } : {},
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  } catch (error) {
    console.error('API Error [getPrograms]: Failed to fetch programs from backend:', error);
    throw error;
  }
}

// Session Storage Cache Constants & Helpers
const SESSION_DASHBOARD_PREFIX = 'unimetric_dashboard_';
const SESSION_ACTIVE_COLLEGE_KEY = 'unimetric_active_college_id';

/**
 * Reads cached college dashboard bundle from sessionStorage.
 * Retains data until user logs out.
 */
export function getSessionDashboardData(collegeId) {
  if (!collegeId) return null;
  try {
    const raw = sessionStorage.getItem(`${SESSION_DASHBOARD_PREFIX}${collegeId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.college) return null;
    return parsed;
  } catch (err) {
    console.warn('Failed to read dashboard from sessionStorage:', err);
    return null;
  }
}

/**
 * Saves college dashboard bundle into sessionStorage for persistent instant access.
 */
export function setSessionDashboardData(collegeId, data) {
  if (!collegeId || !data) return;
  try {
    sessionStorage.setItem(`${SESSION_DASHBOARD_PREFIX}${collegeId}`, JSON.stringify({
      ...data,
      cachedAt: Date.now(),
    }));
    sessionStorage.setItem(SESSION_ACTIVE_COLLEGE_KEY, String(collegeId));
  } catch (err) {
    console.warn('Failed to save dashboard to sessionStorage:', err);
  }
}

/**
 * Retrieves the currently active/last-viewed college ID in the session.
 */
export function getSessionActiveCollegeId() {
  try {
    return sessionStorage.getItem(SESSION_ACTIVE_COLLEGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Clears all dashboard session data. Called automatically on user logout.
 */
export function clearDashboardSessionCache() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('unimetric_') || key.includes('dashboard') || key.includes('college'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch (err) {
    console.warn('Failed to clear dashboard session storage:', err);
  }
}

/**
 * High-performance bundled dashboard fetcher.
 * Checks sessionStorage first. If missing, requests /api/colleges/<id>/dashboard-bundle/
 * or parallelizes requests, caching the bundle in sessionStorage until logout.
 */
export async function getCollegeDashboardBundle(collegeId, { bypassCache = false } = {}) {
  if (!collegeId) return null;

  if (!bypassCache) {
    const cached = getSessionDashboardData(collegeId);
    if (cached) {
      return cached;
    }
  }

  // 1. Try single round-trip bundle endpoint
  try {
    const res = await axios.get(`${API_BASE_URL}/colleges/${collegeId}/dashboard-bundle/`);
    if (res.data && res.data.college) {
      setSessionDashboardData(collegeId, res.data);
      return res.data;
    }
  } catch (err) {
    console.warn(`Bundle endpoint unavailable for college ${collegeId}, falling back to parallel fetch:`, err.message);
  }

  // 2. Parallel fallback
  try {
    const [college, reviews, insights] = await Promise.all([
      getCollegeById(collegeId, { bypassCache }),
      getReviewsByCollegeId(collegeId, { bypassCache }),
      getCollegeInsights(collegeId, { bypassCache }).catch(() => null),
    ]);

    const bundle = { college, reviews, insights };
    if (college) {
      setSessionDashboardData(collegeId, bundle);
    }
    return bundle;
  } catch (err) {
    console.error(`Failed to load dashboard data for college ${collegeId}:`, err);
    throw err;
  }
}

/**
 * Finds a single college by its id. Checks session cache first.
 * @param {string|number} id - The college id
 * @returns {Object|undefined} The college object or undefined if not found
 */
export async function getCollegeById(id, { bypassCache = false } = {}) {
  if (!bypassCache) {
    const sessionData = getSessionDashboardData(id);
    if (sessionData && sessionData.college) {
      return sessionData.college;
    }
  }

  try {
    const res = await axios.get(`${API_BASE_URL}/colleges/${id}/summary/`);
    return res.data;
  } catch (error) {
    console.error(`API Error [getCollegeById]: Failed to fetch college ${id}:`, error);
    if (error.response && error.response.status === 404) return undefined;
    throw error;
  }
}

/**
 * Returns all reviews belonging to a specific college. Checks session cache first.
 * @param {string|number} collegeId - The college id to filter by
 * @returns {Array} Filtered array of review objects
 */
export async function getReviewsByCollegeId(collegeId, { bypassCache = false } = {}) {
  if (!bypassCache) {
    const sessionData = getSessionDashboardData(collegeId);
    if (sessionData && Array.isArray(sessionData.reviews)) {
      return sessionData.reviews;
    }
  }

  try {
    const res = await axios.get(`${API_BASE_URL}/colleges/${collegeId}/reviews/`);
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  } catch (error) {
    console.error(`API Error [getReviewsByCollegeId]: Failed to fetch reviews for college ${collegeId}:`, error);
    throw error;
  }
}

/**
 * Searches colleges by name, location, or program (case-insensitive).
 * @param {string} query - The search string
 * @returns {Promise<Array>} Filtered array of college objects matching the query
 */
export async function searchColleges(query) {
  try {
    const res = await axios.get(`${API_BASE_URL}/colleges/`, {
      params: query ? { search: query } : {},
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && Array.isArray(data.colleges)) return data.colleges;
    return [];
  } catch (error) {
    console.error('API Error [searchColleges]: Failed to search colleges:', error);
    throw error;
  }
}

/**
 * Gets comparison for two colleges
 */
export async function compareColleges(idA, idB) {
  try {
    const res = await axios.get(`${API_BASE_URL}/colleges/compare/`, {
      params: { ids: `${idA},${idB}` },
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  } catch (error) {
    console.error(`API Error [compareColleges]: Failed to compare colleges ${idA} and ${idB}:`, error);
    throw error;
  }
}

/**
 * Submits a new review and invalidates any cached session dashboard data for that college
 */
export async function submitReview(payload, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(`${API_BASE_URL}/reviews/`, payload, { headers });
  
  // Invalidate local session storage cache for this college so new submission is reflected immediately
  if (payload.collegeId) {
    try {
      sessionStorage.removeItem(`${SESSION_DASHBOARD_PREFIX}${payload.collegeId}`);
    } catch {
      // Ignore sessionStorage exceptions
    }
  }
  
  return res.data;
}

/**
 * Checks if a user has already submitted a review for the current academic year
 * @param {string} userId
 * @param {string} [token]
 * @param {string} [admissionDate]
 */
export async function checkUserReview(userId, token, admissionDate) {
  if (!userId) return { hasSubmitted: false };
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params = { user_id: userId };
    if (admissionDate) {
      params.admission_date = admissionDate;
    }
    const res = await axios.get(`${API_BASE_URL}/reviews/`, {
      params,
      headers,
    });
    const data = res.data;
    const hasSubmitted = Boolean(
      data?.has_submitted || data?.hasSubmitted || (Array.isArray(data) && data.length > 0)
    );
    return {
      hasSubmitted,
      college_id: data?.college_id,
      college_name: data?.college_name,
      year_of_study: data?.year_of_study,
    };
  } catch (error) {
    console.error('API Error [checkUserReview]: Failed to check user review status:', error);
    return { hasSubmitted: false };
  }
}

/**
 * Registers a student profile in the backend database.
 * @param {Object} studentData
 * @param {string} [token]
 */
export async function registerStudent(studentData, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.post(`${API_BASE_URL}/students/register/`, studentData, { headers });
    return res.data;
  } catch (error) {
    console.error('API Error [registerStudent]: Failed to register student profile:', error);
    throw error;
  }
}

/**
 * Gets pre-computed ML insights for a specific college. Checks session cache first.
 * @param {string|number} collegeId
 * @param {Object} [options]
 * @returns {Object} Insights: keyDrivers, clusterSummary, associationRules, predictiveRecommendScore
 */
export async function getCollegeInsights(collegeId, { bypassCache = false } = {}) {
  if (!bypassCache) {
    const sessionData = getSessionDashboardData(collegeId);
    if (sessionData && sessionData.insights) {
      return sessionData.insights;
    }
  }

  try {
    const res = await axios.get(`${API_BASE_URL}/analytics/college/${collegeId}/insights/`);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 404) return null;
    throw error;
  }
}

/**
 * Gets global analytics overview (category clusters + cross-college rules).
 * @returns {Object} Overview: categoryClusters, crossCollegeRules
 */
export async function getOverviewInsights() {
  try {
    const res = await axios.get(`${API_BASE_URL}/analytics/overview/`);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 404) return null;
    throw error;
  }
}

/**
 * Fetches macro-level admin system summary (live counts, sentiment breakdown, latest submissions, signups, ML pipeline status)
 * @returns {Promise<Object>}
 */
export async function getAdminSystemSummary() {
  try {
    const res = await axios.get(`${API_BASE_URL}/admin/system-summary/`);
    return res.data;
  } catch (error) {
    console.error('API Error [getAdminSystemSummary]: Failed to fetch admin summary:', error);
    throw error;
  }
}

/**
 * Triggers the Machine Learning pipeline (K-Means, Ridge Regression, Apriori, GaussianNB, Decision Tree).
 * Invalidates cache and updates ML models.
 * @returns {Promise<Object>}
 */
export async function triggerAnalyticsPipeline() {
  try {
    const res = await axios.post(`${API_BASE_URL}/analytics/refresh/`, {});
    return res.data;
  } catch (error) {
    console.error('API Error [triggerAnalyticsPipeline]: Failed to trigger analytics pipeline:', error);
    throw error;
  }
}

/**
 * Creates a new college institution in the database (Admin only).
 * @param {Object} collegeData - { name, location, college_type }
 * @param {string} [token] - Optional Supabase auth JWT token
 * @returns {Promise<Object>} Created college object
 */
export async function createCollege(collegeData, token) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Role': 'Admin',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await axios.post(`${API_BASE_URL}/colleges/`, collegeData, { headers });
    return res.data;
  } catch (error) {
    console.error('API Error [createCollege]: Failed to create college:', error);
    throw error;
  }
}

/**
 * Permanently deletes a college institution and cascades to all its programs and reviews (Admin only).
 * @param {number|string} collegeId - College primary key ID
 * @param {string} [token] - Optional Supabase auth JWT token
 * @returns {Promise<Object>} Deletion confirmation response
 */
export async function deleteCollege(collegeId, token) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Role': 'Admin',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await axios.delete(`${API_BASE_URL}/colleges/${collegeId}/`, { headers });
    return res.data;
  } catch (error) {
    console.error(`API Error [deleteCollege]: Failed to delete college ${collegeId}:`, error);
    throw error;
  }
}



