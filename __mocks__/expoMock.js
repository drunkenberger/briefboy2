module.exports = {
  EventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    emit: jest.fn(),
  })),
};