import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MatchGraph = ({ candidates }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Match Score Distribution',
        color: '#666666',
        font: {
          family: 'Inter',
          size: 12,
          weight: '600'
        },
        padding: { bottom: 16 }
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#ffffff',
        bodyColor: '#888888',
        borderColor: '#2a2a2a',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 10,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#1a1a1a',
          drawBorder: false
        },
        ticks: { 
          color: '#444444',
          font: { family: 'Inter', size: 11 },
          callback: (value) => value + '%'
        },
        border: { display: false }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: { 
          color: '#666666',
          font: { family: 'Inter', size: 11, weight: '500' }
        },
        border: { display: false }
      }
    }
  };

  const data = {
    labels: candidates.map(c => c.name.split(' ')[0]),
    datasets: [
      {
        label: 'Match Score',
        data: candidates.map(c => c.matchScore),
        backgroundColor: candidates.map(c => {
          if (c.matchScore >= 80) return '#ffffff';
          if (c.matchScore >= 50) return '#666666';
          return '#2a2a2a';
        }),
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default MatchGraph;
