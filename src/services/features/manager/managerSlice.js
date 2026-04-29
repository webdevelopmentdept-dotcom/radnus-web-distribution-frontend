// // src/services/features/manager/managerSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import API from '../../API/api';

// export const getManagers = createAsyncThunk('manager/getAll', async (_, { rejectWithValue }) => {
//   try { const res = await API.get('/api/managers'); return res.data; }
//   catch (err) { return rejectWithValue(err.response?.data); }
// });

// export const addManager = createAsyncThunk('manager/add', async (data, { rejectWithValue }) => {
//   try {
//     const res = await API.post('/api/managers', data, { headers: { 'Content-Type': 'multipart/form-data' } });
//     return res.data;
//   } catch (err) { return rejectWithValue(err.response?.data); }
// });

// export const deleteManager = createAsyncThunk('manager/delete', async (id) => {
//   await API.delete(`/api/managers/${id}`);
//   return id;
// });

// const managerSlice = createSlice({
//   name: 'manager',
//   initialState: { list: [], loading: false, error: null },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(getManagers.pending,   (state) => { state.loading = true; })
//       .addCase(getManagers.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
//       .addCase(getManagers.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })
//       .addCase(addManager.fulfilled,  (state, action) => { state.list.unshift(action.payload); })
//       .addCase(deleteManager.fulfilled, (state, action) => {
//         state.list = state.list.filter(m => m._id !== action.payload);
//       });
//   },
// });

// export default managerSlice.reducer;

//---------------------

// src/services/features/manager/managerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../API/api';

// ---------- Fetch all managers ----------
export const getManagers = createAsyncThunk(
  'manager/getManagers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/api/managers');
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// ---------- Add new manager (with photo) ----------
export const addManager = createAsyncThunk(
  'manager/addManager',
  async (data, { rejectWithValue }) => {
    try {
      const res = await API.post('/api/managers', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// ---------- Delete manager ----------
export const deleteManager = createAsyncThunk(
  'manager/deleteManager',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/api/managers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// ---------- Update manager (approve/reject/edit) ----------
export const updateManager = createAsyncThunk(
  'manager/updateManager',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/api/managers/${id}`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// ---------- Slice ----------
const managerSlice = createSlice({
  name: 'manager',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getManagers
      .addCase(getManagers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getManagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addManager
      .addCase(addManager.pending, (state) => {
        state.loading = true;
      })
      .addCase(addManager.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload); // or unshift – both work
      })
      .addCase(addManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteManager
      .addCase(deleteManager.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManager.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((manager) => manager._id !== action.payload);
      })
      .addCase(deleteManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateManager (approve/reject)
      .addCase(updateManager.fulfilled, (state, action) => {
        const index = state.list.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export default managerSlice.reducer;

