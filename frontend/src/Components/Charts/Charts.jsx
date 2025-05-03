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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tasks');
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };

    fetchTasks();
  }, []);

  const priorityLabels = ['High', 'Medium', 'Low'];
  const priorityCounts = priorityLabels.map(
    (priority) => tasks.filter((task) => task.priority === priority).length
  );

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.filter((task) => !task.completed).length;

  const createdDates = [...new Set(
    tasks
      .map((task) => {
        const date = new Date(task.created_at);
        return !isNaN(date) ? date.toISOString().split('T')[0] : null;
      })
      .filter(Boolean)
  )].sort();

  const tasksPerDay = createdDates.map(
    (date) =>
      tasks.filter((task) => {
        const taskDate = new Date(task.created_at).toISOString().split('T')[0];
        return taskDate === date;
      }).length
  );

  return (
    <div>
      <Navbar />
      <div className="main-content container text-white">
        <h2 className="fw-bold mb-4 text-center">📊 Task Analytics</h2>

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
