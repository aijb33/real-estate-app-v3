
import { Client, Account, ID } from 'appwrite';

// Initialize the Appwrite Client
// We use the global endpoint 'https://cloud.appwrite.io/v1' which is more reliable for general access.
// If you specifically need 'nyc.cloud.appwrite.io', ensure your network allows it and the project is strictly in that region.
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('69167ba700183b0ddff8'); // Your Project ID

const account = new Account(client);

export const appwriteAuth = {
  // Create a new account
  register: async (email: string, password: string, name: string) => {
    try {
      const result = await account.create(ID.unique(), email, password, name);
      // Automatically log in after registration
      return await account.createEmailPasswordSession(email, password);
    } catch (error: any) {
      console.error("Appwrite Register Error:", error);
      if (error.message === 'Failed to fetch') {
        throw new Error("Connection failed. Please ensure 'localhost' (or your current domain) is added as a 'Web Platform' in your Appwrite Project settings.");
      }
      throw error;
    }
  },

  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error: any) {
      console.error("Appwrite Login Error:", error);
      if (error.message === 'Failed to fetch') {
        throw new Error("Connection failed. Please ensure 'localhost' (or your current domain) is added as a 'Web Platform' in your Appwrite Project settings.");
      }
      throw error;
    }
  },

  // Get current user session
  getCurrentUser: async () => {
    try {
      return await account.get();
    } catch (error) {
      // No active session
      return null;
    }
  },

  // Logout
  logout: async () => {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error("Appwrite Logout Error:", error);
      throw error;
    }
  }
};
