module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'], // Assuming your app runs on this URL during CI
      startServerCommand: 'npm run start', // Command to start your dev server
      startServerReadyTimeout: 10000,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      assertions: {
        'categories.performance': ['warn', { minScore: 0.90 }],
        'categories.accessibility': ['error', { minScore: 1 }],
        'categories.best-practices': ['warn', { minScore: 0.90 }],
        'categories.seo': ['warn', { minScore: 0.90 }],
      },
    },
  },
};
