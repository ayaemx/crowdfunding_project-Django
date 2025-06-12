import { authAPI, projectsAPI, categoriesAPI } from '../services/api';

export const testDjangoConnection = async () => {
  console.log('🔄 Testing Django API connection...');

  try {
    // Test categories endpoint (should work without auth)
    const categoriesResponse = await categoriesAPI.getAll();
    console.log('✅ Categories API working:', categoriesResponse.data);

    // Test projects homepage data
    const homepageResponse = await projectsAPI.getHomepageData();
    console.log('✅ Homepage API working:', homepageResponse.data);

    return true;
  } catch (error) {
    console.error('❌ API Connection failed:', error);
    console.error('Error details:', error.response?.data);
    return false;
  }
};

// Call this function to test connection
export default testDjangoConnection;
