import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../API/api'; // Adjust path if necessary

// Fetch all activity logs
export const fetchActivityLogs = createAsyncThunk(
  'activity/fetchLogs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/activity-logs');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Create a new activity log (if needed)
export const createActivityLog = createAsyncThunk(
  'activity/createLog',
  async (logData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/activity-logs', logData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState: {
    logs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        // In case the payload is not an array but an object with `logs`
        state.logs = Array.isArray(action.payload)
          ? action.payload
          : action.payload.logs || [];
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload?.error || 'Failed to fetch logs';
      });
  },
});

export default activitySlice.reducer;