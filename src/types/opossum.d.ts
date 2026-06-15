declare module 'opossum' {
  import { EventEmitter } from 'events';

  interface Options {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    [key: string]: any;
  }

  class CircuitBreaker extends EventEmitter {
    constructor(action: (...args: any[]) => Promise<any>, options?: Options);
    fire(...args: any[]): Promise<any>;
    fallback(action: (...args: any[]) => any): this;
    // Add other methods if needed
  }

  export default CircuitBreaker;
}
