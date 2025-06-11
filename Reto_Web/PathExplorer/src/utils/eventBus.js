// Simple event bus for cross-component communication
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
}

// Create singleton instance
const eventBus = new EventBus();

// Event names
export const EVENTS = {
  AI_CERT_ADDED: 'ai_cert_added',
  TIMELINE_REFRESH: 'timeline_refresh'
};

export default eventBus;