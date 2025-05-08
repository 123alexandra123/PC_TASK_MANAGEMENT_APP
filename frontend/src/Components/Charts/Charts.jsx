import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import './Charts.css';

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const Charts = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tasks?page=1&limit=100');
        const data = await res.json();
        const tasksWithSLA = data.tasks.map(task => ({
          ...task,
          sla: {
            status: calculateSLAStatus(task),
            deadline: task.sla_deadline,
            timeRemaining: calculateTimeRemaining(task.sla_deadline)
          }
        }));
        setTasks(tasksWithSLA);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };

    fetchTasks();
  }, [refresh]);

  // Helper function to calculate SLA status
  const calculateSLAStatus = (task) => {
    if (task.completed) return 'Completed';
    
    const now = new Date();
    const deadline = new Date(task.sla_deadline);
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) return 'Breached';
    if (hoursLeft <= 4) return 'At Risk';
    return 'On Track';
  };

  // Helper function to calculate remaining time
  const calculateTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return Math.max(0, Math.floor((deadlineDate - now) / (1000 * 60 * 60)));
  };

  const filteredTasks = selectedPriority === 'All' 
    ? tasks 
    : tasks.filter(task => task.priority === selectedPriority);

  const priorityLabels = ['High', 'Medium', 'Low'];
  const priorityCounts = priorityLabels.map(
    (priority) => filteredTasks.filter((task) => task.priority === priority).length
  );

  const completedCount = filteredTasks.filter((task) => task.completed).length;
  const pendingCount = filteredTasks.filter((task) => !task.completed).length;

  const createdDates = [...new Set(
    filteredTasks
      .map((task) => {
        const date = new Date(task.created_at);
        return !isNaN(date) ? date.toISOString().split('T')[0] : null;
      })
      .filter(Boolean)
  )].sort();

  const tasksPerDay = createdDates.map(
    (date) =>
      filteredTasks.filter((task) => {
        const taskDate = new Date(task.created_at).toISOString().split('T')[0];
        return taskDate === date;
      }).length
  );

  // Add SLA status counts calculation
  const slaStatusCounts = {
    breached: filteredTasks.filter(task => task.sla?.status === 'Breached').length,
    completed: filteredTasks.filter(task => task.sla?.status === 'Completed').length
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
          {/* Bar Chart */}
          <div className="col-md-6">
            <div className="chart-card">
              <h5 className="text-white text-center mb-3">Tasks by Priority</h5>
              <Bar
                data={{
                  labels: priorityLabels,
                  datasets: [
                    {
                      label: 'Number of Tasks',
                      data: priorityCounts,
                      backgroundColor: ['#f44336', '#ff9800', '#4caf50'],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      ticks: {
                        color: '#ccc',
                        precision: 0,
                      },
                    },
                    x: {
                      ticks: { color: '#ccc' },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="col-md-6">
            <div className="chart-card">
              <h5 className="text-white text-center mb-3">Completed vs Pending</h5>
              <Doughnut
                data={{
                  labels: ['Completed', 'Pending'],
                  datasets: [
                    {
                      data: [completedCount, pendingCount],
                      backgroundColor: ['#57f0a9', '#ffcc00'],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                      callbacks: {
                        label: (context) =>
                          `${context.label}: ${Math.round(context.raw)}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* SLA Chart */}
<div className="col-md-6">
  <div className="chart-card">
    <h5 className="text-white text-center mb-3">SLA Status Distribution</h5>
    <Doughnut
      data={{
        labels: ['Breached', 'Completed'],
        datasets: [{
          data: [
            slaStatusCounts.breached,
            slaStatusCounts.completed
          ],
          backgroundColor: ['#f44336', '#8bc34a']
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
              label: (context) => 
                `${context.label}: ${context.raw} tasks`
            }
          }
        }
      }}
    />
  </div>
</div>

          {/* Line Chart */}
          <div className="col-md-12">
            <div className="chart-card">
              <h5 className="text-white text-center mb-3">Tasks Created Over Time</h5>
              <Line
                data={{
                  labels: createdDates,
                  datasets: [
                    {
                      label: 'Tasks Created',
                      data: tasksPerDay,
                      borderColor: '#42a5f5',
                      backgroundColor: '#42a5f5',
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: '#fff' },
                    },
                  },
                  scales: {
                    x: { ticks: { color: '#ccc' } },
                    y: {
                      ticks: {
                        color: '#ccc',
                        precision: 0,
                      },
                    },
                  },
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