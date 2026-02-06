// Backend API for hospitals
const API = import.meta.env.VITE_API || "http://localhost:3000";

/**
 * Search hospitals by city and/or state via backend
 * @param {Object} params - Search parameters
 * @param {string} params.city - City name
 * @param {string} params.state - State abbreviation (e.g., 'NY', 'CA')
 * @param {number} params.limit - Maximum number of results (default: 100)
 * @returns {Promise<Array>} Array of hospital objects
 */
export async function searchHospitalsByCityState({ city, state, limit = 100 }) {
  try {
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (state) params.append("state", state);
    params.append("limit", limit.toString());

    console.log("Search request:", `${API}/hospitals/search?${params}`);

    const response = await fetch(`${API}/hospitals/search?${params}`);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Search results:", data.length, "hospitals found");

    return data;
  } catch (error) {
    console.error("Error searching hospitals:", error);
    return [];
  }
}

/**
 * Search hospitals by name via backend
 * @param {string} name - Hospital name to search
 * @param {number} limit - Maximum number of results (default: 50)
 * @returns {Promise<Array>} Array of hospital objects
 */
export async function searchHospitalsByName(name, limit = 50) {
  try {
    const params = new URLSearchParams();
    params.append("name", name);
    params.append("limit", limit.toString());

    const response = await fetch(`${API}/hospitals/search?${params}`);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Search results:", data.length, "hospitals found");

    return data;
  } catch (error) {
    console.error("Error searching hospitals by name:", error);
    return [];
  }
}

// Posts API Functions
export async function getAllPosts() {
  try {
    const response = await fetch(`${API}/posts`);
    if (!response.ok) throw new Error("Failed to fetch posts");
    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostsByUserId(userId) {
  try {
    const response = await fetch(`${API}/posts/user/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user posts");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
}

export async function createPost(body, token) {
  try {
    const response = await fetch(`${API}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body }),
    });
    if (!response.ok) throw new Error("Failed to create post");
    return await response.json();
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
}

export async function deletePost(postId, token) {
  try {
    const response = await fetch(`${API}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete post");
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    return false;
  }
}

// User API Functions
export async function getUserProfile(userId) {
  try {
    const response = await fetch(`${API}/users/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user profile");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function updateUserProfile(userData, token) {
  try {
    const response = await fetch(`${API}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}
