import React from 'react'
import { motion } from "motion/react"
import useGreedyStore from '../../store/greedyStore'

const ActivitySelectionVisualizer = () => {
  const { activities, selectedActivities } = useGreedyStore()

  // Find the maximum finish time for scale calculation
  const maxTime = activities.length > 0 
    ? Math.max(...activities.map(a => a.finish)) 
    : 10;

  // Function to generate appropriate tick marks based on max time
  const generateTimeMarkers = () => {
    // If too many time points, show fewer markers to prevent overlap
    const step = maxTime > 20 ? 2 : 1;
    const markers = [];

    for (let i = 0; i <= maxTime; i += step) {
      markers.push(i);
    }

    // Ensure the last marker is always included
    if (markers[markers.length - 1] !== maxTime) {
      markers.push(maxTime);
    }

    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  return (
    <div className="flex flex-col gap-4 mt-10">
      {/* Algorithm explanation */}
      <div className="p-4 rounded-lg bg-slate-800">
        <h3 className="mb-2 text-lg font-bold text-white">Activity Selection Algorithm</h3>
        <p className="text-gray-300">
          The activity selection problem is a greedy algorithm that selects non-conflicting activities
          that require exclusive use of a common resource, with the goal of maximizing the number of activities.
          The algorithm works by:
        </p>
        <ul className="pl-5 mt-2 text-gray-300 list-disc">
          <li>Sorting all activities by finish time</li>
          <li>Always selecting the activity with the earliest finish time</li>
          <li>Skipping activities that overlap with already selected ones</li>
        </ul>
      </div>

      {/* Activities display */}
      <div className="flex flex-wrap gap-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className={`p-4 rounded-lg ${
              selectedActivities.includes(activity) ? 'bg-green-500' : 'bg-blue-500'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-lg font-bold text-white">Activity {activity.id}</div>
            <div className="text-sm text-white">
              Start: {activity.start} <br />
              Finish: {activity.finish}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Improved Timeline visualization with better marker spacing */}
      <div className="p-4 rounded-lg bg-slate-800">
        <h3 className="mb-2 text-lg font-bold text-white">Timeline Visualization</h3>
        <div className="relative p-2 overflow-x-auto bg-gray-900 rounded-lg h-80">
          {/* Container to ensure proper width for the timeline */}
          <div className="relative min-w-full" style={{ minWidth: '800px', height: '100%' }}>
            {/* Time markers with better spacing */}
            <div className="absolute top-0 left-0 flex items-end w-full h-8">
              {timeMarkers.map((time) => (
                <div 
                  key={time} 
                  className="absolute flex flex-col items-center"
                  style={{ left: `${(time / maxTime) * 100}%` }}
                >
                  <div className="h-3 border-l border-gray-500"></div>
                  <div className="text-xs text-gray-400">{time}</div>
                </div>
              ))}
            </div>

            {/* Time axis line */}
            <div className="absolute left-0 w-full h-px bg-gray-500 top-8"></div>

            {/* Activities on timeline - with more space */}
            <div className="absolute left-0 w-full top-12">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative h-10 mb-4">
                  <div className="absolute text-xs text-gray-400 -left-6 top-2">
                    A{activity.id}
                  </div>
                  <motion.div
                    className={`absolute h-8 rounded-md ${
                      selectedActivities.includes(activity) ? 'bg-green-500' : 'bg-blue-500'
                    } flex items-center justify-center`}
                    style={{
                      left: `${(activity.start / maxTime) * 100}%`,
                      width: `${((activity.finish - activity.start) / maxTime) * 100}%`,
                      minWidth: '24px' // Ensure visibility for very short activities
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <span className="px-1 text-xs text-white whitespace-nowrap">
                      {activity.start}-{activity.finish}
                    </span>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Selected activities indicator - positioned better */}
            <div className="absolute left-0 w-full px-2 bottom-2">
              <div className="w-full h-px mb-1 bg-gray-600"></div>
              <div className="text-sm font-semibold text-green-300">Selected Activities</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    className="px-2 py-1 text-xs text-white bg-green-500 rounded-md"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    A{activity.id} ({activity.start}-{activity.finish})
                  </motion.div>
                ))}
                {selectedActivities.length === 0 && 
                  <span className="text-xs text-gray-400">Run algorithm to see selected activities</span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Instructions for interaction */}
        <div className="mt-1 text-xs italic text-gray-500">
          Scroll horizontally if timeline is too wide
        </div>
      </div>

      {/* Remove the duplicated "Selected Activities" section to avoid redundancy */}
      {/* Keep just this one section with more details */}
      <div className="p-4 rounded-lg bg-slate-800">
        <h3 className="mb-2 text-lg font-bold text-white">Selected Activities Details</h3>
        <div className="flex flex-wrap gap-2">
          {selectedActivities.length > 0 ? (
            selectedActivities.map(activity => (
              <motion.div
                key={activity.id}
                className="px-3 py-2 bg-green-500 rounded"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                Activity {activity.id} (Time: {activity.start}-{activity.finish})
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400">No activities selected yet. Press &quot;Start&quot; to run the algorithm.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivitySelectionVisualizer
