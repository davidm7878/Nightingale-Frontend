const CMS_API =
  "https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0";

// Hospital API Functions - Using CMS API

/**
 * Search hospitals by city and/or state from CMS API
 * @param {Object} params - Search parameters
 * @param {string} params.city - City name
 * @param {string} params.state - State abbreviation (e.g., 'NY', 'CA')
 * @param {number} params.limit - Maximum number of results (default: 100)
 * @returns {Promise<Array>} Array of hospital objects
 */
export async function searchHospitalsByCityState({ city, state, limit = 100 }) {
  try {
    const conditions = [];

    if (city) {
      conditions.push({
        property: "city",
        value: city.toUpperCase(),
        operator: "=",
      });
    }

    if (state) {
      conditions.push({
        property: "state",
        value: state.toUpperCase(),
        operator: "=",
      });
    }

    const requestBody = {
      limit: limit,
      offset: 0,
    };

    if (conditions.length > 0) {
      requestBody.conditions = conditions;
    }

    const response = await fetch(CMS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((hospital) => ({
      cms_id: hospital.facility_id,
      name: hospital.facility_name,
      street: hospital.address,
      city: hospital.city,
      state: hospital.state,
      zip_code: hospital.zip_code,
      phone: hospital.phone_number,
      hospital_type: hospital.hospital_type,
      ownership: hospital.hospital_ownership,
      rating: hospital.hospital_overall_rating,
    }));
  } catch (error) {
    console.error("Error searching hospitals:", error);
    return [];
  }
}

/**
 * Search hospitals by name from CMS API
 * @param {string} name - Hospital name to search
 * @param {number} limit - Maximum number of results (default: 50)
 * @returns {Promise<Array>} Array of hospital objects
 */
export async function searchHospitalsByName(name, limit = 50) {
  try {
    const requestBody = {
      limit: limit,
      offset: 0,
      conditions: [
        {
          property: "facility_name",
          value: `%${name.toUpperCase()}%`,
          operator: "LIKE",
        },
      ],
    };

    const response = await fetch(CMS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((hospital) => ({
      cms_id: hospital.facility_id,
      name: hospital.facility_name,
      street: hospital.address,
      city: hospital.city,
      state: hospital.state,
      zip_code: hospital.zip_code,
      phone: hospital.phone_number,
      hospital_type: hospital.hospital_type,
      ownership: hospital.hospital_ownership,
      rating: hospital.hospital_overall_rating,
    }));
  } catch (error) {
    console.error("Error searching hospitals by name:", error);
    return [];
  }
}

/**
 * Get all hospitals from CMS API (limited to first 100)
 * @param {number} limit - Maximum number of results (default: 100)
 * @returns {Promise<Array>} Array of hospital objects
 */
export async function getAllHospitals(limit = 100) {
  try {
    const requestBody = {
      limit: limit,
      offset: 0,
    };

    const response = await fetch(CMS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((hospital) => ({
      cms_id: hospital.facility_id,
      name: hospital.facility_name,
      street: hospital.address,
      city: hospital.city,
      state: hospital.state,
      zip_code: hospital.zip_code,
      phone: hospital.phone_number,
      hospital_type: hospital.hospital_type,
      ownership: hospital.hospital_ownership,
      rating: hospital.hospital_overall_rating,
    }));
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return [];
  }
}

/**
 * Get a specific hospital by facility ID from CMS API
 * @param {string} facilityId - CMS Facility ID
 * @returns {Promise<Object|null>} Hospital object or null if not found
 */
export async function getHospitalById(facilityId) {
  try {
    const requestBody = {
      limit: 1,
      offset: 0,
      conditions: [
        {
          property: "facility_id",
          value: facilityId,
          operator: "=",
        },
      ],
    };

    const response = await fetch(CMS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results.length === 0) {
      return null;
    }

    const hospital = data.results[0];
    return {
      cms_id: hospital.facility_id,
      name: hospital.facility_name,
      street: hospital.address,
      city: hospital.city,
      state: hospital.state,
      zip_code: hospital.zip_code,
      phone: hospital.phone_number,
      hospital_type: hospital.hospital_type,
      ownership: hospital.hospital_ownership,
      rating: hospital.hospital_overall_rating,
    };
  } catch (error) {
    console.error("Error fetching hospital:", error);
    return null;
  }
}

// Backend API for posts, reviews, and user data
const API = import.meta.env.VITE_API || "http://localhost:3000";

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
