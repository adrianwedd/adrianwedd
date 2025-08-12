/**
 * State Manager Module
 * Manages application state and provides reactive updates
 */

export class StateManager {
  constructor() {
    this.state = new Map();
    this.listeners = new Map();
    this.history = [];
    this.maxHistorySize = 50;
    
    // Initialize default state
    this.initializeDefaultState();
  }

  /**
   * Initialize default application state
   */
  initializeDefaultState() {
    this.setState('terminal', {
      isReady: false,
      currentDirectory: '~',
      user: 'guest',
      hostname: 'adrianwedd.com'
    });
    
    this.setState('session', {
      startTime: Date.now(),
      commandCount: 0,
      lastActivity: Date.now()
    });
    
    this.setState('features', {
      aiEnabled: true,
      voiceEnabled: false,
      musicEnabled: false,
      effectsEnabled: true,
      debugMode: false
    });
    
    this.setState('ui', {
      theme: 'matrix',
      fontSize: 'medium',
      soundEnabled: true,
      animationsEnabled: true
    });
  }

  /**
   * Get state value
   */
  getState(key, path = null) {
    const state = this.state.get(key);
    
    if (!path) {
      return state;
    }
    
    // Navigate nested path
    return path.split('.').reduce((obj, prop) => obj?.[prop], state);
  }

  /**
   * Set state value
   */
  setState(key, value, options = {}) {
    const previousValue = this.state.get(key);
    
    // Deep clone if object
    const newValue = typeof value === 'object' ? 
      JSON.parse(JSON.stringify(value)) : value;
    
    this.state.set(key, newValue);
    
    // Add to history if tracking is enabled
    if (options.track !== false) {
      this.addToHistory(key, previousValue, newValue);
    }
    
    // Notify listeners
    this.notifyListeners(key, newValue, previousValue);
    
    // Persist to localStorage if specified
    if (options.persist) {
      this.persistState(key, newValue);
    }
    
    return newValue;
  }

  /**
   * Update nested state value
   */
  updateState(key, path, value) {
    const state = this.getState(key);
    if (!state || typeof state !== 'object') {
      throw new Error(`State ${key} is not an object`);
    }
    
    const newState = JSON.parse(JSON.stringify(state));
    const pathParts = path.split('.');
    const lastPart = pathParts.pop();
    
    // Navigate to nested object
    let target = newState;
    for (const part of pathParts) {
      if (!target[part]) {
        target[part] = {};
      }
      target = target[part];
    }
    
    target[lastPart] = value;
    
    return this.setState(key, newState);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key).add(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  /**
   * Notify listeners of state change
   */
  notifyListeners(key, newValue, previousValue) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(newValue, previousValue, key);
        } catch (error) {
          console.error(`Error in state listener for ${key}:`, error);
        }
      });
    }
    
    // Notify global listeners
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(listener => {
        try {
          listener({ key, newValue, previousValue });
        } catch (error) {
          console.error('Error in global state listener:', error);
        }
      });
    }
  }

  /**
   * Add state change to history
   */
  addToHistory(key, previousValue, newValue) {
    this.history.push({
      key,
      previousValue,
      newValue,
      timestamp: Date.now()
    });
    
    // Trim history if too large
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get state history
   */
  getHistory(key = null) {
    if (key) {
      return this.history.filter(entry => entry.key === key);
    }
    return [...this.history];
  }

  /**
   * Persist state to localStorage
   */
  persistState(key, value) {
    try {
      const storageKey = `terminal-state-${key}`;
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to persist state ${key}:`, error);
    }
  }

  /**
   * Load persisted state from localStorage
   */
  loadPersistedState(key) {
    try {
      const storageKey = `terminal-state-${key}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error(`Failed to load persisted state ${key}:`, error);
    }
    return null;
  }

  /**
   * Clear all state
   */
  clearState() {
    this.state.clear();
    this.history = [];
    this.initializeDefaultState();
  }

  /**
   * Export current state
   */
  exportState() {
    const stateObject = {};
    for (const [key, value] of this.state) {
      stateObject[key] = value;
    }
    return stateObject;
  }

  /**
   * Import state
   */
  importState(stateObject, options = {}) {
    for (const [key, value] of Object.entries(stateObject)) {
      this.setState(key, value, { track: false, ...options });
    }
  }

  /**
   * Create computed state value
   */
  computed(dependencies, computeFn) {
    const compute = () => {
      const values = dependencies.map(dep => this.getState(dep));
      return computeFn(...values);
    };
    
    // Subscribe to all dependencies
    dependencies.forEach(dep => {
      this.subscribe(dep, () => {
        const result = compute();
        // Trigger update for computed value
        this.notifyListeners('computed', result);
      });
    });
    
    // Return initial computed value
    return compute();
  }

  /**
   * Batch state updates
   */
  batch(updateFn) {
    const updates = [];
    const batchState = {
      set: (key, value) => {
        updates.push({ key, value });
      },
      update: (key, path, value) => {
        updates.push({ key, path, value, isUpdate: true });
      }
    };
    
    updateFn(batchState);
    
    // Apply all updates
    updates.forEach(({ key, value, path, isUpdate }) => {
      if (isUpdate) {
        this.updateState(key, path, value);
      } else {
        this.setState(key, value);
      }
    });
  }

  /**
   * Get state statistics
   */
  getStats() {
    return {
      stateCount: this.state.size,
      listenerCount: Array.from(this.listeners.values())
        .reduce((sum, set) => sum + set.size, 0),
      historySize: this.history.length,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage
   */
  estimateMemoryUsage() {
    try {
      const stateString = JSON.stringify(this.exportState());
      return stateString.length;
    } catch {
      return 0;
    }
  }
}

export default StateManager;