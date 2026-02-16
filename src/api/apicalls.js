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

/**
 * Search hospitals by zip code via backend
 * @param {string} zipcode - 5-digit zip code
 * @param {string} state - State abbreviation (optional, for fallback search)
 * @param {number} limit - Maximum number of results (default: 100)
 * @returns {Promise<Array>} Array of hospital objects
 */
export async function searchHospitalsByZipcode(
  zipcode,
  state = null,
  limit = 100,
) {
  try {
    const params = new URLSearchParams();
    params.append("zipcode", zipcode);
    if (state) params.append("state", state);
    params.append("limit", limit.toString());

    console.log("Zipcode search request:", `${API}/hospitals/search?${params}`);

    const response = await fetch(`${API}/hospitals/search?${params}`);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Zipcode search results:", data.length, "hospitals found");

    return data;
  } catch (error) {
    console.error("Error searching hospitals by zipcode:", error);
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

// Like/Dislike API Functions
export async function likePost(postId, token) {
  try {
    const response = await fetch(`${API}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to like post");
    return await response.json();
  } catch (error) {
    console.error("Error liking post:", error);
    return null;
  }
}

export async function unlikePost(postId, token) {
  try {
    const response = await fetch(`${API}/posts/${postId}/like`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to unlike post");
    return await response.json();
  } catch (error) {
    console.error("Error unliking post:", error);
    return null;
  }
}

export async function dislikePost(postId, token) {
  try {
    const response = await fetch(`${API}/posts/${postId}/dislike`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to dislike post");
    return await response.json();
  } catch (error) {
    console.error("Error disliking post:", error);
    return null;
  }
}

export async function undislikePost(postId, token) {
  try {
    const response = await fetch(`${API}/posts/${postId}/dislike`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to remove dislike");
    return await response.json();
  } catch (error) {
    console.error("Error removing dislike:", error);
    return null;
  }
}

// Comment API Functions
export async function getCommentsByPostId(postId) {
  try {
    const response = await fetch(`${API}/posts/${postId}/comments`);
    if (!response.ok) throw new Error("Failed to fetch comments");
    return await response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function createComment(postId, body, token) {
  try {
    const response = await fetch(`${API}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body }),
    });
    if (!response.ok) throw new Error("Failed to create comment");
    return await response.json();
  } catch (error) {
    console.error("Error creating comment:", error);
    return null;
  }
}

export async function deleteComment(postId, commentId, token) {
  try {
    const response = await fetch(
      `${API}/posts/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to delete comment");
    return await response.json();
  } catch (error) {
    console.error("Error deleting comment:", error);
    return null;
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(errorText || "Failed to update profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

// Rating API Functions
export async function getRatingsByHospitalId(hospitalId) {
  try {
    const response = await fetch(`${API}/ratings/hospital/${hospitalId}`);
    if (!response.ok) throw new Error("Failed to fetch ratings");
    return await response.json();
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return { ratings: [], average: 0, total: 0 };
  }
}

export async function createRating(hospitalId, ratingValue, token) {
  try {
    const response = await fetch(`${API}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hospital_id: hospitalId,
        rating_value: ratingValue,
      }),
    });
    if (!response.ok) throw new Error("Failed to create rating");
    return await response.json();
  } catch (error) {
    console.error("Error creating rating:", error);
    return null;
  }
}

// Review API Functions
export async function getReviewsByHospitalId(hospitalId) {
  try {
    const response = await fetch(`${API}/reviews/hospital/${hospitalId}`);
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return await response.json();
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function createReview(hospitalId, body, token) {
  try {
    const response = await fetch(`${API}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hospital_id: hospitalId, body }),
    });
    if (!response.ok) throw new Error("Failed to create review");
    return await response.json();
  } catch (error) {
    console.error("Error creating review:", error);
    return null;
  }
}

export async function deleteReview(reviewId, token) {
  try {
    const response = await fetch(`${API}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete review");
    return await response.json();
  } catch (error) {
    console.error("Error deleting review:", error);
    return null;
  }
}

// User Follow API Functions
export async function followUser(userId, token) {
  try {
    const response = await fetch(`${API}/users/${userId}/follow`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to follow user");
    return await response.json();
  } catch (error) {
    console.error("Error following user:", error);
    return null;
  }
}

export async function unfollowUser(userId, token) {
  try {
    const response = await fetch(`${API}/users/${userId}/follow`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to unfollow user");
    return await response.json();
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return null;
  }
}

export async function isFollowingUser(userId, token) {
  try {
    const response = await fetch(`${API}/users/${userId}/is-following`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to check follow status");
    const data = await response.json();
    return data.isFollowing;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

export async function getFollowingUsers(userId) {
  try {
    const response = await fetch(`${API}/users/${userId}/following`);
    if (!response.ok) throw new Error("Failed to fetch following users");
    return await response.json();
  } catch (error) {
    console.error("Error fetching following users:", error);
    return [];
  }
}

// Hospital Follow API Functions
export async function followHospital(hospitalId, token) {
  try {
    const response = await fetch(`${API}/hospitals/${hospitalId}/follow`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to follow hospital");
    return await response.json();
  } catch (error) {
    console.error("Error following hospital:", error);
    return null;
  }
}

export async function unfollowHospital(hospitalId, token) {
  try {
    const response = await fetch(`${API}/hospitals/${hospitalId}/follow`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to unfollow hospital");
    return await response.json();
  } catch (error) {
    console.error("Error unfollowing hospital:", error);
    return null;
  }
}

export async function isFollowingHospital(hospitalId, token) {
  try {
    const response = await fetch(
      `${API}/hospitals/${hospitalId}/is-following`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to check follow status");
    const data = await response.json();
    return data.isFollowing;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

export async function getFollowedHospitals(token) {
  try {
    const response = await fetch(`${API}/hospitals/following`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch followed hospitals");
    return await response.json();
  } catch (error) {
    console.error("Error fetching followed hospitals:", error);
    return [];
  }
}
