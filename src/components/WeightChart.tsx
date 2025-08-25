'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { WeightEntry } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface WeightChartProps {
  entries: WeightEntry[]
  targetWeight?: number
}

export default function WeightChart({ entries, targetWeight }: WeightChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  // Sort entries by date (oldest first for chart display)
  const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime())

  const data = {
    labels: sortedEntries.map(entry => 
      entry.date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: 'Weight',
        data: sortedEntries.map(entry => entry.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      ...(targetWeight ? [{
        label: 'Target Weight',
        data: new Array(sortedEntries.length).fill(targetWeight),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      }] : [])
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label === 'Weight') {
              return `Weight: ${context.parsed.y.toFixed(1)} lbs`
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} lbs`
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: '500' as const
          }
        },
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
          font: {
            size: 11,
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Weight (lbs)',
          font: {
            size: 12,
            weight: '500' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return value.toFixed(0) + ' lbs'
          },
          font: {
            size: 11,
          }
        },
        // Adjust scale to show meaningful range
        min: function(context: any) {
          const weights = sortedEntries.map(entry => entry.weight)
          const minWeight = Math.min(...weights, targetWeight || Infinity)
          return Math.max(0, minWeight - 10)
        },
        max: function(context: any) {
          const weights = sortedEntries.map(entry => entry.weight)
          const maxWeight = Math.max(...weights, targetWeight || 0)
          return maxWeight + 10
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No data to display</p>
          <p className="text-sm">Start logging your weight to see progress charts</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  )
}