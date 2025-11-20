// error.test.tsx
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Page from './page'; 
import { act } from 'react';
import React from 'react'; 

// Use Jest's fake timers to speed up the exponential backoff (1s + 2s + 4s)
jest.useFakeTimers();

describe('Page Component Error Handling', () => {
    
    const mockFetch = jest.fn();
    // Replace the global fetch with our mock before all tests
    global.fetch = mockFetch as any;

    const mockErrorResponse = (status: number, detail: string) => ({ 
        ok: false, 
        status: status, 
        json: async () => ({ detail: detail }) 
    });

    beforeEach(() => {
        // Clear mocks before each test
        mockFetch.mockClear();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('should show the final error message after 3 retries on 500 failure', async () => {

    const mockErrorResponse = (status: number, detail: string) => ({ 
        ok: false, 
        status: status, 
        // This MUST be an async function, as it is awaited in your component logic
        json: async () => ({ detail: "Internal server error" }) 
    });

    // 1. Configure the mock fetch to fail all 3 attempts
    mockFetch
        .mockResolvedValueOnce(mockErrorResponse(500, "error detail")) // Call 1 (on render)
        .mockResolvedValueOnce(mockErrorResponse(500, "error detail")) // Call 2 (after 1s delay)
        .mockResolvedValueOnce(mockErrorResponse(500, "error detail")); // Call 3 (after 2s delay)
    
    // 2. Render the component (triggers Call 1 immediately and starts the 1000ms timer)
    await act(async () => {
        render(<Page />); 
    });

    // Initial check: Call 1 is done
    expect(mockFetch).toHaveBeenCalledTimes(1); 
    
    // --- 1st Retry (1000ms delay) ---
    // 3. Advance timer and process all microtasks to trigger Call 2
    
    // Step 3a: Advance the 1000ms timer
    jest.advanceTimersByTime(1000); 
    
    // Step 3b: Flush microtasks and React state changes to commit Call 2
    await act(async () => {
        await Promise.resolve(); // CRITICAL: Forces the promise chain for Call 2 to complete
    });
    
    // Check call count after the first retry
    expect(mockFetch).toHaveBeenCalledTimes(2); // THIS IS NOW GUARANTEED TO PASS
    

    // --- 2nd Retry (2000ms delay) ---
    // 4. Advance timer and process all microtasks to trigger Call 3 (Final call)
    
    // Step 4a: Advance the 2000ms timer
    jest.advanceTimersByTime(2000); 
    
    // Step 4b: Flush microtasks and React state changes to commit Call 3 fail -> set error & isLoading=false
    await act(async () => {
        // This MUST fully process the end of the retry loop, setting the final error state
        // and, critically, setting isLoading to false.
        await Promise.resolve();
    });

    // 5. Wait for the final state to appear in the DOM. 
    // The previous act *should* have done it, but if it's asynchronous or delayed, waitFor will catch it.
    await waitFor(() => {
        // Final check: All 3 calls are complete
        expect(mockFetch).toHaveBeenCalledTimes(3); 
        
        // The error message MUST be present
        expect(screen.getByText(
            /Failed to fetch data after 3 attempts. Error: Internal server error/i
        )).toBeInTheDocument();
        
        // The loading text MUST NOT be present.
        // This confirms the component finished rendering the final error state.
        expect(screen.queryByText(/Loading data.../i)).not.toBeInTheDocument();
        
    }, { timeout: 200 }); // Increase timeout slightly for extra safety, just in case of slow virtual timers.
    });

}); 

