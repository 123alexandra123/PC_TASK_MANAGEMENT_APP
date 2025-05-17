import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Charts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Charts = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTasks = async () => {
    try {
      let url = 'http://localhost:5000/api/tasks?page=1&limit=100';
      
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [startDate, endDate]);

  // Filter tasks by both date and priority
  const filteredTasks = tasks.filter(task => {
    const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority;
    const taskDate = new Date(task.created_at).toISOString().split('T')[0];
    const matchesDate = (!startDate || taskDate >= startDate) && 
                       (!endDate || taskDate <= endDate);
    return matchesPriority && matchesDate;
  });

  const handleClearFilters = () => {
    setSelectedPriority('All');
    setStartDate('');
    setEndDate('');
  };

  // Priority counts
  const priorityLabels = ['High', 'Medium', 'Low'];
  const priorityCounts = priorityLabels.map(
    (priority) => filteredTasks.filter((task) => task.priority === priority).length
  );

  // Completion counts
  const completedCount = filteredTasks.filter((task) => task.completed).length;
  const pendingCount = filteredTasks.filter((task) => !task.completed).length;

  // Tasks over time data
  const createdDates = [...new Set(
    filteredTasks
      .map((task) => new Date(task.created_at).toISOString().split('T')[0])
      .sort()
  )];

  const tasksPerDay = createdDates.map(
    (date) => filteredTasks.filter((task) => 
      new Date(task.created_at).toISOString().split('T')[0] === date
    ).length
  );

  // SLA status counts
  const slaStatusCounts = {
    waiting: filteredTasks.filter(task => 
      !task.completed && new Date(task.sla_deadline) > new Date()
    ).length,
    breached: filteredTasks.filter(task => 
      !task.completed && new Date(task.sla_deadline) <= new Date()
    ).length,
    completed: filteredTasks.filter(task => 
      task.completed
    ).length
  };

  // Team-wise task counts
  const teamLabels = [...new Set(filteredTasks.map(task => task.team_name))];
  const teamCounts = teamLabels.map(
    (team) => filteredTasks.filter((task) => task.team_name === team).length
  );

  return (
    <div>
      <Navbar />
      <div className="main-content container text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">📊 Task Analytics</h2>
          <button 
            className="btn btn-outline-light"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'} 🔍
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel mb-4 p-3 bg-dark rounded border border-secondary">
            <div className="row g-3">
              {/* Priority Filter */}
              <div className="col-12">
                <h5 className="mb-2">Filter by Priority</h5>
                <div className="d-flex gap-2">
                  <button
                    className={`btn ${selectedPriority === 'All' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setSelectedPriority('All')}
                  >
                    All
                  </button>
                  {['High', 'Medium', 'Low'].map((priority) => (
                    <button
                      key={priority}
                      className={`btn ${selectedPriority === priority ? 'btn-light' : 'btn-outline-light'}`}
                      onClick={() => setSelectedPriority(priority)}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div className="col-12">
                <h5 className="mb-2">Filter by Date Range</h5>
                <div className="d-flex gap-3 align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <label>From:</label>
                    <input
                      type="date"
                      className="form-control bg-dark text-white"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <label>To:</label>
                    <input
                      type="date"
                      className="form-control bg-dark text-white"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-outline-light"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* Priority Bar Chart */}
          <div className="col-md-6">
            <div className="chart-card">
              <h5 className="text-white text-center mb-3">Tasks by Priority</h5>
              <Bar
                data={{
                  labels: priorityLabels,
                  datasets: [{
                    label: 'Number of Tasks',
                    data: priorityCounts,
                    backgroundColor: ['#f44336', '#ff9800', '#4caf50']
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { ticks: { color: '#ccc', precision: 0 } },
                    x: { ticks: { color: '#ccc' } }
                  }
                }}
              />
            </div>
          </div>

          {/* Completion Status Chart */}
          <div className="col-md-6">
            <div className="chart-card">
              <h5 className="text-white text-center mb-3">Completed vs Pending</h5>
              <Doughnut
                data={{
                  labels: ['Completed', 'Pending'],
                  datasets: [{
                    data: [completedCount, pendingCount],
                    backgroundColor: ['#57f0a9', '#ffcc00']
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      position: 'bottom',
                      labels: { color: '#fff' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* SLA Status Chart */}
          <div className="col-md-6">
            <div className="chart-card">
              <h5 className="text-white text-center mb-3">SLA Status Distribution</h5>
              <Doughnut
                data={{
                  labels: ['Waiting', 'Breached', 'Completed'],
                  datasets: [{
                    data: [
                      slaStatusCounts.waiting,
                      slaStatusCounts.breached,
                      slaStatusCounts.completed
                    ],
                    backgroundColor: ['#ffeb3b', '#f44336', '#8bc34a']
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#fff' }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: ${context.raw} tasks`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Tasks by Team Chart */}
          <div className="col-md-6">
            <div className="chart-card">
              <h5 className="text-white text-center mb-3">Tasks by Team</h5>
              <Bar
                data={{
                  labels: teamLabels,
                  datasets: [{
                    label: 'Number of Tasks',
                    data: teamCounts,
                    backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ef5350']
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { ticks: { color: '#ccc', precision: 0 } },
                    x: { ticks: { color: '#ccc' } }
                  }
                }}
              />
            </div>
          </div>

          {/* Tasks Over Time Chart */}
          <div className="col-md-12">
            <div className="chart-card">
              <h5 className="text-white text-center mb-3">Tasks Created Over Time</h5>
              <Line
                data={{
                  labels: createdDates,
                  datasets: [{
                    label: 'Tasks Created',
                    data: tasksPerDay,
                    borderColor: '#42a5f5',
                    backgroundColor: '#42a5f5',
                    tension: 0.3
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: '#fff' } }
                  },
                  scales: {
                    x: { ticks: { color: '#ccc' } },
                    y: { ticks: { color: '#ccc', precision: 0 } }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;