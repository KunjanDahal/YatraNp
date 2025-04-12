import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/images/event.jpg';
import axios from 'axios';

const Activity = ({ id, name, description, startTime, endTime, image, type }) => {
  const navigate = useNavigate();
  const truncatedDescription = description ? description.substring(0, 100) + '...' : 'No description';
  
  return (
    <div className='bg-white border border-gray-200 p-4 rounded-lg shadow-md mb-4 flex items-center'>
      <div className='flex-shrink-0'>
        <img
          src={image || 'https://via.placeholder.com/200?text=No+Image'}
          alt={`Image for ${name}`}
          className='rounded-lg object-cover'
          width={'200px'}
          height={'200px'}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200?text=Image+Error';
          }}
        />
      </div>
      <div className='ml-4 flex-1'>
        <div className="flex items-center">
          <h2
            onClick={() => {
              navigate(`/activities/${id}`);
            }}
            className='text-lg font-bold mb-2 text-gray-800 hover:text-blue-500 cursor-pointer'
          >
            {name || 'Unnamed Activity'}
          </h2>
          <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-200 text-blue-800">{type || 'No Type'}</span>
        </div>
        <p className='text-gray-700 mb-2'>{truncatedDescription}</p>
        <p className='text-gray-700'>
          {startTime || 'N/A'} - {endTime || 'N/A'}
        </p>
      </div>
    </div>
  );
};

const ActivityList = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search filters or check back later.</p>
      </div>
    );
  }
  
  return (
    <div>
      {activities.map((activity) => (
        <Activity
          key={activity._id || Math.random().toString()}
          id={activity._id || 'no-id'}
          name={activity.name || 'Unnamed Activity'}
          description={activity.description || 'No description available'}
          startTime={activity.timeRange?.startTime || activity.startTime || 'N/A'}
          endTime={activity.timeRange?.endTime || activity.endTime || 'N/A'}
          image={activity.image || 'https://via.placeholder.com/200?text=No+Image'}
          type={activity.type || 'Unknown'}
        />
      ))}
    </div>
  );
};

const FilterActivities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState([]);
  const [activityType, setActivityType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    
    try {
      console.log('Fetching activities from public endpoint');
      
      // Try the new public endpoint that doesn't require authentication
      const response = await axios.get('/api/activities/all-public');
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success && response.data.activities) {
        setActivities(response.data.activities);
      } else {
        // Fallback to approved activities endpoint
        const fallbackResponse = await axios.get('/api/activities/public');
        
        console.log('Fallback response:', fallbackResponse.data);
        
        if (fallbackResponse.data && fallbackResponse.data.activities) {
          setActivities(fallbackResponse.data.activities);
        } else {
          throw new Error('No activities found in API response');
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      
      // One more try with full URL
      try {
        console.log('Trying with full URL');
        
        const fullUrlResponse = await axios.get('http://localhost:5000/api/activities/all-public');
        
        if (fullUrlResponse.data && fullUrlResponse.data.activities) {
          setActivities(fullUrlResponse.data.activities);
        } else {
          throw new Error('No activities found in full URL response');
        }
      } catch (secondError) {
        console.error('All fetch attempts failed:', secondError);
        
        // Display friendly error to user
        Swal.fire({
          icon: 'error',
          title: 'Unable to load activities',
          text: 'Please check your connection and try again',
        });
        
        setActivities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Filter activities locally based on search query and type
    if (!searchQuery && !activityType) {
      // If no filters, fetch all activities
      fetchActivities();
      return;
    }
    
    // Clone the current activities for filtering
    let filteredActivities = [...activities];
    
    // Apply search query filter if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredActivities = filteredActivities.filter(activity => 
        (activity.name && activity.name.toLowerCase().includes(query)) ||
        (activity.description && activity.description.toLowerCase().includes(query))
      );
    }
    
    // Apply activity type filter if provided
    if (activityType) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.type === activityType
      );
    }
    
    // Update state with filtered activities
    setActivities(filteredActivities);
  };

  return (
    <div className='bg-cover bg-center'>
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='bg-[#DEEFFF] flex items-center justify-center w-full flex-col lg:flex-row'>
          <div className='p-8 pt-5 md:p-24 md:pt-5 lg:p-5'>
            <h1 className='text-3xl md:text-3xl font-bold uppercase text-[#272727] mb-10'>
              Find the
              <span className='text-[#41A4FF]'> Special Activity</span>
              <br />
              for your next stay today!
            </h1>
            <div className='mb-4'>
              <input
                className='border rounded-lg px-4 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
                style={{ width: '700px' }}
                type='text'
                placeholder='Search activities by name or description'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>
          <div className='p-8'>
            <img
              src={backgroundImage}
              alt='activities header'
              style={{ borderRadius: '10px', width: '500px', height: 'auto' }}
            />
          </div>
        </div>
      </div>
      <div
        className='flex max-w-7xl mx-auto p-4 gap-10 mt-10'
        style={{ marginBottom: '20rem' }}
      >
        <div className='w-1/4 pr-4'>
          <h2 className='text-lg font-semibold mb-4'>Filter Activities</h2>
          <div className='mb-4'>
            <label className='block font-medium mb-2'>Activity Type</label>
            <select
              className='border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={activityType}
              onChange={(event) =>
                event.target.value === 'ALL'
                  ? setActivityType('')
                  : setActivityType(event.target.value)
              }
            >
              <option value='ALL'>ALL</option>
              <option value='INDOOR'>Indoor</option>
              <option value='OUTDOOR'>Outdoor</option>
            </select>
          </div>
          <button
            className='bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600'
            onClick={handleSearch}
          >
            Apply Filters
          </button>
          <button
            className='mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg w-full hover:bg-gray-300'
            onClick={fetchActivities}
          >
            Reset Filters
          </button>
        </div>
        <div className='w-3/4'>
          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <CircularProgress />
              <p className="ml-4">Loading activities...</p>
            </div>
          ) : (
            <ActivityList activities={activities} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterActivities;
