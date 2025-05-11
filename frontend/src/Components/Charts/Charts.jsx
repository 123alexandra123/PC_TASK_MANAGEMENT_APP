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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tasks?page=1&limit=100');
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = selectedPriority === 'All' 
    ? tasks 
    : tasks.filter(task => task.priority === selectedPriority);

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

  return (
    <div>
      <Navbar />
      <div className="main-content container text-white">
        <h2 className="fw-bold mb-4 text-center">📊 Task Analytics</h2>

        {/* Priority Filter Buttons */}
        <div className="priority-filter text-center mb-4">
          <button
            className={`btn ${selectedPriority === 'All' ? 'btn-success' : 'btn-outline-success'} mx-1`}
            onClick={() => setSelectedPriority('All')}
          >
            All
          </button>
          {priorityLabels.map((priority) => (
            <button
              key={priority}
              className={`btn ${selectedPriority === priority ? 'btn-success' : 'btn-outline-success'} mx-1`}
              onClick={() => setSelectedPriority(priority)}
            >
              {priority}
            </button>
          ))}
        </div>

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