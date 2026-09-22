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

/**
 * Finds a single college by its id.
 * @param {string|number} id - The college id
 * @returns {Object|undefined} The college object or undefined if not found
 */
export async function getCollegeById(id) {
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
 * Returns all reviews belonging to a specific college.
 * @param {string|number} collegeId - The college id to filter by
 * @returns {Array} Filtered array of review objects
 */
export async function getReviewsByCollegeId(collegeId) {
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
 * Submits a new review
 */
export async function submitReview(payload, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(`${API_BASE_URL}/reviews/`, payload, { headers });
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
 * Gets pre-computed ML insights for a specific college.
 * @param {string|number} collegeId
 * @returns {Object} Insights: keyDrivers, clusterSummary, associationRules, predictiveRecommendScore
 */
export async function getCollegeInsights(collegeId) {
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
