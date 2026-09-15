import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

/**
 * Returns all colleges.
 * @returns {Array} Array of college objects
 */
export async function getColleges() {
  const res = await axios.get(`${API_BASE_URL}/colleges/`);
  return res.data;
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
  const res = await axios.get(`${API_BASE_URL}/colleges/${collegeId}/reviews/`);
  return res.data;
}

/**
 * Searches colleges by name, location, or program (case-insensitive).
 * @param {string} query - The search string
 * @returns {Array} Filtered array of college objects matching the query
 */
export async function searchColleges(query) {
  const res = await axios.get(`${API_BASE_URL}/colleges/`, {
    params: query ? { search: query } : {},
  });
  return res.data;
}

/**
 * Gets comparison for two colleges
 */
export async function compareColleges(idA, idB) {
  const res = await axios.get(`${API_BASE_URL}/colleges/compare/`, {
    params: { ids: `${idA},${idB}` },
  });
  return res.data;
}

/**
 * Submits a new review
 */
export async function submitReview(payload) {
  const res = await axios.post(`${API_BASE_URL}/reviews/`, payload);
  return res.data;
}
