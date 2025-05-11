// src/services/taskService.js
const API_URL = "http://localhost:5000/api/tasks";

export const getTasks = async (page = 1, limit = 5) => {
  try {
    const response = await fetch(`http://localhost:5000/api/tasks?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Task service response:', data); // Add this debug log
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (task) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return await res.json();
};

export const updateTask = async (id, task) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return await res.json();
};

export const deleteTaskById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return await res.json();
};

export const toggleTaskStatus = async (id) => {
  const res = await fetch(`${API_URL}/${id}/toggle`, {
    method: 'PATCH',
  });
  return await res.json();
};
