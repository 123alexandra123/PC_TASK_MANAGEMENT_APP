// src/services/taskService.js
const API_URL = "http://localhost:5000/api/tasks";

export const getTasks = async (page = 1, limit = 5, filter = null) => {
  const filterQuery = filter ? `&filter=${filter}` : '';
  const res = await fetch(`${API_URL}?page=${page}&limit=${limit}${filterQuery}`);
  return await res.json();
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
