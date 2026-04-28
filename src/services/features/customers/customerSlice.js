// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import API from '../../API/api';

// /* =======================
//    THUNKS
// ======================= */

// // Fetch all customers
// export const fetchAllCustomers = createAsyncThunk(
//   'customer/fetchAll',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await API.get('/api/customers');
//       return res.data.customers;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || 'Failed to fetch customers'
//       );
//     }
//   }
// );

// // Add customer
// export const addCustomer = createAsyncThunk(
//   'customer/add',
//   async (customerData, { rejectWithValue }) => {
//     try {
//       const res = await API.post('/api/customers', customerData);
//       return res.data.customer;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || 'Failed to add customer'
//       );
//     }
//   }
// );

// // Update customer
// export const updateCustomer = createAsyncThunk(
//   'customer/update',
//   async ({ phone, data }, { rejectWithValue }) => {
//     try {
//       const res = await API.put(`/api/customers/${phone}`, data);
//       return res.data.customer;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || 'Failed to update customer'
//       );
//     }
//   }
// );

// // Delete customer
// export const deleteCustomer = createAsyncThunk(
//   'customer/delete',
//   async (phone, { rejectWithValue }) => {
//     try {
//       await API.delete(`/api/customers/${phone}`);
//       return phone;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || 'Failed to delete customer'
//       );
//     }
//   }
// );

// // Lookup customer
// export const lookupCustomer = createAsyncThunk(
//   'customer/lookup',
//   async (phone, { rejectWithValue }) => {
//     try {
//       const res = await API.get(`/api/customers/${phone}`);
//       return res.data.customer;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || 'Customer not found'
//       );
//     }
//   }
// );

// /* =======================
//    SLICE
// ======================= */

// const customerSlice = createSlice({
//   name: 'customer',
//   initialState: {
//     list: [],

//     // loading states
//     loading: false,
//     addLoading: false,
//     updateLoading: false,
//     deleteLoading: false,
//     lookupLoading: false,

//     // success flags
//     addSuccess: false,
//     updateSuccess: false,
//     deleteSuccess: false,

//     error: null,
//   },

//   reducers: {
//     // Clear error
//     clearCustomerError: (state) => {
//       state.error = null;
//     },

//     // Reset entire state
//     resetCustomer: (state) => {
//       state.list = [];
//       state.loading = false;
//       state.addLoading = false;
//       state.updateLoading = false;
//       state.deleteLoading = false;
//       state.lookupLoading = false;
//       state.addSuccess = false;
//       state.updateSuccess = false;
//       state.deleteSuccess = false;
//       state.error = null;
//     },

//     // Clear add state
//     clearAddState: (state) => {
//       state.addLoading = false;
//       state.addSuccess = false;
//       state.error = null;
//     },

//     // Clear update state
//     clearUpdateState: (state) => {
//       state.updateLoading = false;
//       state.updateSuccess = false;
//       state.error = null;
//     },

//     // Clear delete state
//     clearDeleteState: (state) => {
//       state.deleteLoading = false;
//       state.deleteSuccess = false;
//       state.error = null;
//     },
//   },

//   extraReducers: (builder) => {
//     /* ===== FETCH ALL ===== */
//     builder
//       .addCase(fetchAllCustomers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllCustomers.fulfilled, (state, action) => {
//         state.loading = false;
//         state.list = action.payload;
//       })
//       .addCase(fetchAllCustomers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });

//     /* ===== ADD ===== */
//     builder
//       .addCase(addCustomer.pending, (state) => {
//         state.addLoading = true;
//         state.addSuccess = false;
//         state.error = null;
//       })
//       .addCase(addCustomer.fulfilled, (state, action) => {
//         state.addLoading = false;
//         state.addSuccess = true;
//         state.list.unshift(action.payload);
//       })
//       .addCase(addCustomer.rejected, (state, action) => {
//         state.addLoading = false;
//         state.error = action.payload;
//       });

//     /* ===== UPDATE ===== */
//     builder
//       .addCase(updateCustomer.pending, (state) => {
//         state.updateLoading = true;
//         state.updateSuccess = false;
//         state.error = null;
//       })
//       .addCase(updateCustomer.fulfilled, (state, action) => {
//         state.updateLoading = false;
//         state.updateSuccess = true;

//         const index = state.list.findIndex(
//           (c) => c.phone === action.payload.phone
//         );
//         if (index !== -1) {
//           state.list[index] = action.payload;
//         }
//       })
//       .addCase(updateCustomer.rejected, (state, action) => {
//         state.updateLoading = false;
//         state.error = action.payload;
//       });

//     /* ===== DELETE ===== */
//     builder
//       .addCase(deleteCustomer.pending, (state) => {
//         state.deleteLoading = true;
//         state.deleteSuccess = false;
//         state.error = null;
//       })
//       .addCase(deleteCustomer.fulfilled, (state, action) => {
//         state.deleteLoading = false;
//         state.deleteSuccess = true;
//         state.list = state.list.filter(
//           (c) => c.phone !== action.payload
//         );
//       })
//       .addCase(deleteCustomer.rejected, (state, action) => {
//         state.deleteLoading = false;
//         state.error = action.payload;
//       });

//     /* ===== LOOKUP ===== */
//     builder
//       .addCase(lookupCustomer.pending, (state) => {
//         state.lookupLoading = true;
//         state.error = null;
//       })
//       .addCase(lookupCustomer.fulfilled, (state) => {
//         state.lookupLoading = false;
//       })
//       .addCase(lookupCustomer.rejected, (state, action) => {
//         state.lookupLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// /* =======================
//    EXPORTS
// ======================= */

// export const {
//   clearCustomerError,
//   resetCustomer,
//   clearAddState,
//   clearUpdateState,
//   clearDeleteState,
// } = customerSlice.actions;

// export default customerSlice.reducer;

// src/services/features/customer/customerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../API/api';

/* =======================
   THUNKS
======================= */

// Fetch all customers
export const fetchAllCustomers = createAsyncThunk(
  'customer/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/api/customers');
      return res.data.customers;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

// Add customer
export const addCustomer = createAsyncThunk(
  'customer/add',
  async (customerData, { rejectWithValue }) => {
    try {
      const res = await API.post('/api/customers', customerData);
      return res.data.customer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add customer');
    }
  }
);

// Update customer
export const updateCustomer = createAsyncThunk(
  'customer/update',
  async ({ phone, data }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/api/customers/${phone}`, data);
      return res.data.customer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update customer');
    }
  }
);

// Delete customer
export const deleteCustomer = createAsyncThunk(
  'customer/delete',
  async (phone, { rejectWithValue }) => {
    try {
      await API.delete(`/api/customers/${phone}`);
      return phone;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete customer');
    }
  }
);

// Lookup customer – ✅ now stores the result
export const lookupCustomer = createAsyncThunk(
  'customer/lookup',
  async (phone, { rejectWithValue }) => {
    try {
      const res = await API.get(`/api/customers/${phone}`);
      return res.data.customer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Customer not found');
    }
  }
);

/* =======================
   SLICE
======================= */

const customerSlice = createSlice({
  name: 'customer',
  initialState: {
    list: [],
    lookupData: null,        // ✅ stores the looked‑up customer
    lookupState: 'idle',     // 'idle' | 'loading' | 'found' | 'notfound' | 'error'

    // loading states
    loading: false,
    addLoading: false,
    updateLoading: false,
    deleteLoading: false,

    // success flags
    addSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,

    error: null,
  },

  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },

    resetCustomer: (state) => {
      state.list = [];
      state.lookupData = null;
      state.lookupState = 'idle';
      state.loading = false;
      state.addLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.addSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },

    clearAddState: (state) => {
      state.addLoading = false;
      state.addSuccess = false;
      state.error = null;
    },

    clearUpdateState: (state) => {
      state.updateLoading = false;
      state.updateSuccess = false;
      state.error = null;
    },

    clearDeleteState: (state) => {
      state.deleteLoading = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /* ===== FETCH ALL ===== */
    builder
      .addCase(fetchAllCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ===== ADD ===== */
    builder
      .addCase(addCustomer.pending, (state) => {
        state.addLoading = true;
        state.addSuccess = false;
        state.error = null;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.addLoading = false;
        state.addSuccess = true;
        state.list.unshift(action.payload);
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload;
      });

    /* ===== UPDATE ===== */
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.updateLoading = true;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        const index = state.list.findIndex((c) => c.phone === action.payload.phone);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });

    /* ===== DELETE ===== */
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.deleteLoading = true;
        state.deleteSuccess = false;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        state.list = state.list.filter((c) => c.phone !== action.payload);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });

    /* ===== LOOKUP ===== – ✅ store result and set correct state */
    builder
      .addCase(lookupCustomer.pending, (state) => {
        state.lookupState = 'loading';
        state.lookupData = null;
        state.error = null;
      })
      .addCase(lookupCustomer.fulfilled, (state, action) => {
        state.lookupState = 'found';
        state.lookupData = action.payload;
      })
      .addCase(lookupCustomer.rejected, (state, action) => {
        if (action.payload === 'Customer not found') {
          state.lookupState = 'notfound';
        } else {
          state.lookupState = 'error';
        }
        state.lookupData = null;
        state.error = action.payload;
      });
  },
});

export const {
  clearCustomerError,
  resetCustomer,
  clearAddState,
  clearUpdateState,
  clearDeleteState,
} = customerSlice.actions;

export default customerSlice.reducer;