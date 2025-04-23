import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import MainPage from './Components/MainPage/MainPage';
import CompletedTasks from './Components/CompletedTasks/CompletedTasks';
import PendingTasks from './Components/PendingTasks/PendingTasks';
import Charts from './Components/Charts/Charts';
import Profile from './Components/Profile/Profile'; // nou

function App() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Finish report',
      priority: 'High',
      createdAt: '2025-04-20',
      deadline: '2025-04-24',
      completed: false
    },
    {
      id: 2,
      title: 'Client presentation',
      priority: 'Medium',
      createdAt: '2025-04-18',
      deadline: '2025-04-23',
      completed: false
    },
    {
      id: 3,
      title: 'App update',
      priority: 'Low',
      createdAt: '2025-04-22',
      deadline: '2025-04-25',
      completed: false
    },
    {
      id: 4,
      title: 'Office supplies',
      priority: 'Medium',
      createdAt: '2025-04-10',
      deadline: '2025-04-26',
      completed: false
    },
    {
      id: 5,
      title: 'Server backup',
      priority: 'High',
      createdAt: '2025-04-21',
      deadline: '2025-04-22',
      completed: false
    },
    {
      id: 6,
      title: 'Client emails',
      priority: 'Low',
      createdAt: '2025-04-17',
      deadline: '2025-04-30',
      completed: false
    },
    {
      id: 7,
      title: 'Feature documentation',
      priority: 'Medium',
      createdAt: '2025-04-16',
      deadline: '2025-04-28',
      completed: false
    },
    {
      id: 8,
      title: 'New UI design',
      priority: 'High',
      createdAt: '2025-04-15',
      deadline: '2025-04-29',
      completed: false
    },
    {
      id: 9,
      title: 'Team meeting',
      priority: 'Low',
      createdAt: '2025-04-14',
      deadline: '2025-04-21',
      completed: false
    },
    {
      id: 10,
      title: 'Fix login bugs',
      priority: 'High',
      createdAt: '2025-04-19',
      deadline: '2025-04-24',
      completed: false
    }
  ]);

  const toggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const editTask = (id, newTitle, newDeadline) => {
    if (!newTitle || !newDeadline) return;
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, title: newTitle, deadline: newDeadline } : task
    ));
  };

  const addTask = (title) => {
    if (!title) return;
    const newTask = {
      id: Date.now(),
      title,
      priority: 'Medium',
      createdAt: new Date().toISOString().slice(0, 10),
      deadline: '2025-04-30',
      completed: false
    };
    setTasks([...tasks, newTask]);
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
            editTask={editTask}
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
