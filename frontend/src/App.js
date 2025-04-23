// App.jsx
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import MainPage from './Components/MainPage/MainPage';
import CompletedTasks from './Components/CompletedTasks/CompletedTasks';
import PendingTasks from './Components/PendingTasks/PendingTasks';
import Charts from './Components/Charts/Charts';
import Profile from './Components/Profile/Profile';

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks');
      const data = await res.json();
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
      <Route path="/" element={<LoginRegister />} />
      <Route path="/login" element={<LoginRegister />} />
      <Route
        path="/main"
        element={
          <MainPage
            tasks={tasks}
            toggleComplete={toggleComplete}
            deleteTask={deleteTask}
            editTask={editTask}
            addTask={addTask}
          />
        }
      />
      <Route
        path="/completed"
        element={
          <CompletedTasks
            tasks={tasks}
            toggleComplete={toggleComplete}
            deleteTask={deleteTask}
          />
        }
      />
      <Route
        path="/pending"
        element={
          <PendingTasks
            tasks={tasks}
            toggleComplete={toggleComplete}
            deleteTask={deleteTask}
            editTask={editTask}
          />
        }
      />
      <Route path="/charts" element={<Charts tasks={tasks} />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;