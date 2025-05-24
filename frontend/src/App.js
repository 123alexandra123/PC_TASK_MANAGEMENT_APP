import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import MainPage from './Components/MainPage/MainPage';
import CompletedTasks from './Components/CompletedTasks/CompletedTasks';
import PendingTasks from './Components/PendingTasks/PendingTasks';
import Charts from './Components/Charts/Charts';
import Profile from './Components/Profile/Profile';
import ManageTeams from './Components/ManageTeams/ManageTeams'; 

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const isAuthenticated = !!sessionStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
}

function PublicRoute({ children }) {
  const navigate = useNavigate();
  const isAuthenticated = !!sessionStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/main');
    }
  }, [isAuthenticated, navigate]);

  return !isAuthenticated ? children : null;
}

// 🛡️ AdminRoute pentru acces doar adminilor (is_admin === '1')
function AdminRoute({ children }) {
  const navigate = useNavigate();
  const isAuthenticated = !!sessionStorage.getItem('token');
  const isAdmin = sessionStorage.getItem('is_admin') === '1';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/main');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  return isAuthenticated && isAdmin ? children : null;
}

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks');
      const data = await res.json();
      console.log("Fetched tasks:", data);
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const addTask = async (newTask) => {
    try {
      await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const editTask = async (id, updatedTask) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      fetchTasks();
    } catch (err) {
      console.error("Error editing task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
      });
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const toggleComplete = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await editTask(task.id, { ...task, completed: !task.completed });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LoginRegister />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginRegister />
          </PublicRoute>
        }
      />
      <Route
        path="/main"
        element={
          <ProtectedRoute>
            <MainPage
              tasks={tasks}
              toggleComplete={toggleComplete}
              deleteTask={deleteTask}
              editTask={editTask}
              addTask={addTask}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/completed"
        element={
          <ProtectedRoute>
            <CompletedTasks
              tasks={tasks}
              toggleComplete={toggleComplete}
              deleteTask={deleteTask}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pending"
        element={
          <ProtectedRoute>
            <PendingTasks
              tasks={tasks}
              toggleComplete={toggleComplete}
              deleteTask={deleteTask}
              editTask={editTask}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/charts"
        element={
          <ProtectedRoute>
            <Charts tasks={tasks} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-teams"
        element={
          <AdminRoute>
            <ManageTeams />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
