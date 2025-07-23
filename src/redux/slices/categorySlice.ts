import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { Alert } from 'react-native';

// --- Category Interface ---
export interface Category {
  _id: string;
  categoryId: number;
  categoryName: string;
  status: string;
  createdAt: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// Async thunk to fetch all categories from the backend
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>('categories/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/categories');
    return response.data.categories || [];
  } catch (error: any) {
    return rejectWithValue('Failed to fetch categories');
  }
});


// Async thunk to add a new category with status 'unapprove' and generated categoryId
export const addCategory = createAsyncThunk<
  Category,
  { categoryName: string },
  { state: { categories: CategoryState }, rejectValue: string }
>('categories/addCategory', async ({ categoryName }, { getState, rejectWithValue }) => {
  try {
    // Generate new categoryId by incrementing max in Redux state
    const categories = getState().categories.categories;
    const maxId = categories && categories.length > 0
      ? Math.max(...categories.map(cat => Number(cat.categoryId) || 0))
      : 0;
    const newCategoryId = maxId + 1;
    Alert.alert('New Category', `Category ID will be: ${newCategoryId}`);
    const response = await api.post('/categories', {
      categoryName,
      status: 'unapprove',
      categoryId: newCategoryId,
      createdAt: new Date().toISOString(),
    });
    // If backend does not return categoryId, add it manually
    const category = response.data.category;
    if (!category.categoryId) {
      category.categoryId = newCategoryId;
    }
    return category;
  } catch (error: any) {
    return rejectWithValue('Failed to add category');
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch categories';
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      });
  },
});

export default categorySlice.reducer;
