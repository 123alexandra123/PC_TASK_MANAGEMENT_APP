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
import * as XLSX from 'xlsx';
import './Charts.css';
import TaskPopup from '../TaskPopup/TaskPopup';

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

// chaert uri componentei

const Charts = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  
  const [popupTasks, setPopupTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupType, setPopupType] = useState('tasks');

  //ia task-urile de la server(din backend)
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

 //ia utilizatorii de la server(din backend)
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    
  }, [startDate, endDate]);

  //filtrarea task-urilor in functie de prioritate, data si departament
  const filteredTasks = tasks.filter(task => {
    const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority;
    const matchesDepartment = selectedDepartment === 'All' || task.team_name === selectedDepartment;
    const taskDate = new Date(task.created_at).toISOString().split('T')[0];
    const matchesDate = (!startDate || taskDate >= startDate) &&
                        (!endDate || taskDate <= endDate);
    return matchesPriority && matchesDate && matchesDepartment;
  });

  //curatare filtre
  const handleClearFilters = () => {
    setSelectedPriority('All');
    setSelectedDepartment('All');
    setStartDate('');
    setEndDate('');
  };

  //exporta task-urile filtrate in fisier excel
  const handleExport = () => {
    const data = filteredTasks.map(task => ({
      Title: task.title,
      Description: task.description,
      Priority: task.priority,
      Completed: task.completed ? 'Yes' : 'No',
      CreatedAt: new Date(task.created_at).toLocaleDateString(),
      Deadline: task.sla_deadline ? new Date(task.sla_deadline).toLocaleDateString() : '',
      Team: task.team_name || '',
      AssignedTo: task.assigned_to_name || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FilteredTasks');

    XLSX.writeFile(workbook, 'task_statistics.xlsx');
  };

  // chart cu prioritati
  const priorityLabels = ['Critical', 'High', 'Medium', 'Low'];
  const priorityCounts = priorityLabels.map(
    priority => filteredTasks.filter(task => task.priority === priority).length
  );

  //numarul de task-uri in functie de status
  const completedCount = filteredTasks.filter(task => task.completed).length;
  const pendingCount = filteredTasks.filter(task => !task.completed).length;

  // task-uri create in functie de data
  const createdDates = [...new Set(
    filteredTasks.map(task => new Date(task.created_at).toISOString().split('T')[0])
  )].sort();

  // numarul de task-uri create in fiecare zi
  const tasksPerDay = createdDates.map(
    date => filteredTasks.filter(task =>
      new Date(task.created_at).toISOString().split('T')[0] === date
    ).length
  );


  // numarul de task-uri in functie de SLA
  const slaStatusCounts = {
    waiting: filteredTasks.filter(task =>
      !task.completed && new Date(task.sla_deadline) > new Date()
    ).length,
    breached: filteredTasks.filter(task =>
      !task.completed && new Date(task.sla_deadline) <= new Date()
    ).length,
    completed: filteredTasks.filter(task => task.completed).length
  };

  // numarul de task-uri in functie de echipa
  const teamLabels = [...new Set(filteredTasks.map(task => task.team_name))];
  const teamCounts = teamLabels.map(
    team => filteredTasks.filter(task => task.team_name === team).length
  );

  // chart cu utilizatori in functie de echipa
  const teamUserMap = users.reduce((acc, user) => {
    if (!user.group) return acc;
    if (!acc[user.group]) acc[user.group] = [];
    acc[user.group].push(user.name);
    return acc;
  }, {});

  const userTeamLabels = Object.keys(teamUserMap);
  const userTeamCounts = userTeamLabels.map(team => teamUserMap[team].length);

  const barColors = [
    '#f44336', '#ff9800', '#4caf50',
    '#2196f3', '#9c27b0', '#00bcd4',
    '#8bc34a', '#ffc107', '#e91e63', '#795548'
  ];

  // gestioneaza click-ul pe chart-uri pentru a deschide popup-ul
  const handleChartDoubleClick = (elements, chartType) => {
    if (!elements.length) return;
    const index = elements[0].index;
    let tasks = [];
    let title = '';
    let type = 'tasks';

    switch (chartType) {
      case 'priority':
        {
          const priority = priorityLabels[index];
          tasks = filteredTasks.filter(task => task.priority === priority);
          title = `${priority} Priority Tasks`;
        }
        break;
      case 'status':
        {
          const status = ['Completed', 'Pending'][index];
          tasks = filteredTasks.filter(task =>
            status === 'Completed' ? task.completed : !task.completed
          );
          title = `${status} Tasks`;
        }
        break;
      case 'sla':
        {
          const slaTypes = ['Waiting', 'Breached', 'Completed'];
          const slaType = slaTypes[index];
          tasks = filteredTasks.filter(task => {
            if (slaType === 'Completed') return task.completed;
            if (slaType === 'Breached') return !task.completed && new Date(task.sla_deadline) <= new Date();
            return !task.completed && new Date(task.sla_deadline) > new Date();
          });
          title = `${slaType} SLA Tasks`;
        }
        break;
      case 'team':
        {
          const team = teamLabels[index];
          tasks = filteredTasks.filter(task => task.team_name === team);
          title = `Tasks for ${team}`;
        }
        break;
      case 'userTeam':
        {
          const team = userTeamLabels[index];
          const usersInTeam = users.filter(user => user.group === team);
          tasks = usersInTeam;
          title = `Users in ${team}`;
          type = 'users';
        }
        break;
      case 'createdDate':
        {
          const date = createdDates[index];
          tasks = filteredTasks.filter(task =>
            new Date(task.created_at).toISOString().split('T')[0] === date
          );
          title = `Tasks Created on ${date}`;
        }
        break;
      default:
        return;
    }

    setPopupTasks(tasks);
    setPopupTitle(title);
    setPopupType(type);
    setShowPopup(true);
  };

  // optiuni pentru chart-uri
  const getChartOptions = (chartType) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
      },
      scales: {
        y: { ticks: { color: '#ccc', precision: 0 } },
        x: { ticks: { color: '#ccc' } }
      }
    };

    if (['priority', 'status', 'sla', 'team', 'userTeam', 'createdDate'].includes(chartType)) {
      return {
        ...baseOptions,
        onClick: (event, elements) => handleChartDoubleClick(elements, chartType)
      };
    }

    return baseOptions;
  };

  // optiuni pentru chart-uri
  const chartOptions = {
    bar: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false }
      },
      scales: {
        y: { 
          ticks: { color: '#ccc', precision: 0 },
          beginAtZero: true
        },
        x: { ticks: { color: '#ccc' } }
      }
    },
    
    doughnut: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: { color: '#fff' }
        }
      }
    }
  };

  // componenta principala in care se afiseaza graficele html
  return (
    <div>
      <Navbar />
      <div className="main-content container text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">📊 Task Analytics</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide Filters' : 'Show Filters'} 🔍
            </button>
            <button className="btn btn-success" onClick={handleExport}>
              Export to Excel ⬇️
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="filters-panel mb-4 p-3 bg-dark rounded border border-secondary">
            <div className="row g-3">
              <div className="col-12">
                <h5 className="mb-2">Filter by Priority</h5>
                <div className="d-flex gap-2">
                  <button 
                    className={`btn ${selectedPriority === 'All' ? 'btn-light' : 'btn-outline-light'}`} 
                    onClick={() => setSelectedPriority('All')}
                  >
                    All
                  </button>
                  {priorityLabels.map(priority => (
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

              {/* Department Filter */}
              <div className="col-12">
                <h5 className="mb-2">Filter by Department</h5>
                <div className="d-flex gap-2">
                  <button 
                    className={`btn ${selectedDepartment === 'All' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setSelectedDepartment('All')}
                  >
                    All
                  </button>
                  {[...new Set(tasks.map(task => task.team_name))].map(department => (
                    <button
                      key={department}
                      className={`btn ${selectedDepartment === department ? 'btn-light' : 'btn-outline-light'}`}
                      onClick={() => setSelectedDepartment(department)}
                    >
                      {department}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-12">
                <h5 className="mb-2">Filter by Date Range</h5>
                <div className="d-flex gap-3 align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <label>From:</label>
                    <input type="date" className="form-control bg-dark text-white" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <label>To:</label>
                    <input type="date" className="form-control bg-dark text-white" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                  <button className="btn btn-outline-light" onClick={handleClearFilters}>Clear All Filters</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="row g-4">
          {/* Tasks by Priority */}
          <div className="col-md-6">
            <div className="chart-card" data-chart-type="priority">
              <h5 className="text-white text-center mb-3">Tasks by Priority</h5>
              <Bar 
                data={{
                  labels: priorityLabels,
                  datasets: [{ 
                    label: 'Number of Tasks', 
                    data: priorityCounts, 
                    backgroundColor: barColors.slice(0, 4) // Update to show 4 colors for Critical
                  }]
                }}
                options={{
                  ...chartOptions.bar,
                  ...getChartOptions('priority')
                }}
              />
            </div>
          </div>

          {/* Completed vs Pending */}
          <div className="col-md-6">
            <div className="chart-card" data-chart-type="status">
              <h5 className="text-white text-center mb-3">Completed vs Pending</h5>
              <Doughnut 
                data={{
                  labels: ['Completed', 'Pending'],
                  datasets: [{ data: [completedCount, pendingCount], backgroundColor: ['#4caf50', '#f44336'] }]
                }}
                options={{
                  ...chartOptions.doughnut,
                  ...getChartOptions('status')
                }}
              />
            </div>
          </div>

          {/* SLA Status */}
          <div className="col-md-6">
            <div className="chart-card" data-chart-type="sla">
              <h5 className="text-white text-center mb-3">SLA Status Distribution</h5>
              <Doughnut 
                data={{
                  labels: ['Waiting', 'Breached', 'Completed'],
                  datasets: [{
                    data: [slaStatusCounts.waiting, slaStatusCounts.breached, slaStatusCounts.completed],
                    backgroundColor: ['#ffc107', '#f44336', '#4caf50']
                  }]
                }}
                options={{
                  ...chartOptions.doughnut,
                  ...getChartOptions('sla')
                }}
              />
            </div>
          </div>

          {/* Tasks by Team */}
          <div className="col-md-6">
            <div className="chart-card" data-chart-type="team">
              <h5 className="text-white text-center mb-3">Tasks by Team</h5>
              <Bar 
                data={{
                  labels: teamLabels,
                  datasets: [{
                    label: 'Number of Tasks',
                    data: teamCounts,
                    backgroundColor: barColors
                  }]
                }}
                options={{
                  ...chartOptions.bar,
                  ...getChartOptions('team')
                }}
              />
            </div>
          </div>

          {/* Users per Team */}
          <div className="col-md-12">
            <div className="chart-card" data-chart-type="userTeam">
              <h5 className="text-white text-center mb-3">Users per Team</h5>
              <Bar 
                data={{
                  labels: userTeamLabels,
                  datasets: [{
                    label: 'Users per Team',
                    data: userTeamCounts,
                    backgroundColor: barColors
                  }]
                }} 
                options={{
                  ...chartOptions.bar,
                  ...getChartOptions('userTeam'),
                  plugins: {
                    ...chartOptions.bar.plugins,
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const team = context.label;
                          const users = teamUserMap[team]?.join(', ') || 'No users';
                          return `Users: ${users}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Tasks Created Over Time */}
          <div className="col-md-12">
            <div className="chart-card" data-chart-type="createdDate">
              <h5 className="text-white text-center mb-3">Tasks Created Over Time</h5>
              <Line 
                data={{
                  labels: createdDates,
                  datasets: [{
                    label: 'Tasks Created',
                    data: tasksPerDay,
                    borderColor: 'rgb(0, 183, 255)',
                    backgroundColor: 'rgb(0, 183, 255)',
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
                  },
                  onClick: (event, elements) => handleChartDoubleClick(elements, 'createdDate')
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Popup component */}
      <TaskPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        tasks={popupTasks}
        title={popupTitle}
        popupType={popupType}
      />
    </div>
  );
};

export default Charts;