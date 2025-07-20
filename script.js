document.getElementById('calculate-button').addEventListener('click', async () => {
    const code = document.getElementById('code-input').value;
    const resultArea = document.getElementById('result-area');
    const complexityOutput = document.getElementById('complexity-output');
    const calculateButton = document.getElementById('calculate-button');
    const buttonText = document.getElementById('button-text');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Reset result area styling
    resultArea.classList.remove('bg-red-100', 'border-red-200', 'bg-green-100', 'border-green-200');
    resultArea.classList.add('bg-gray-100', 'border-gray-200');

    if (code.trim() === '') {
        complexityOutput.textContent = 'Please enter some code to analyze.';
        resultArea.classList.remove('hidden');
        resultArea.classList.add('bg-red-100', 'border-red-200'); // Indicate error
        return;
    }

    // Show loading state
    buttonText.textContent = 'Analyzing...';
    loadingSpinner.classList.remove('hidden');
    calculateButton.disabled = true;
    resultArea.classList.remove('hidden');
    complexityOutput.textContent = 'Analyzing your code... Please wait.';

    try {
        // Prepare the prompt for the LLM
        let chatHistory = [];
        const prompt = `Analyze the following code and determine its time complexity in Big O notation. Provide only the Big O notation and a very brief explanation (1-2 sentences) of why, focusing on the dominant operations. If the code is not valid or cannot be analyzed, state that.

Code:
\`\`\`
${code}
\`\`\`

Example Output:
O(N) - The loop iterates N times.
O(N^2) - Nested loops iterate N*N times.
O(log N) - Binary search halves the search space in each step.
O(1) - Constant time operations.
`;
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        const payload = { contents: chatHistory };
        const apiKey = ""; // Canvas will automatically provide this
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const analysisText = result.candidates[0].content.parts[0].text;
            complexityOutput.textContent = analysisText;
            resultArea.classList.add('bg-green-100', 'border-green-200'); // Indicate success
        } else {
            console.error('Unexpected API response structure:', result);
            complexityOutput.textContent = 'Failed to get analysis from the backend. Please try again.';
            resultArea.classList.add('bg-red-100', 'border-red-200'); // Indicate error
        }

    } catch (error) {
        console.error('Error during API call:', error);
        complexityOutput.textContent = 'An error occurred while analyzing the code. Please check your network connection or try again later.';
        resultArea.classList.add('bg-red-100', 'border-red-200'); // Indicate error
    } finally {
        // Hide loading state
        buttonText.textContent = 'Analyze Time Complexity';
        loadingSpinner.classList.add('hidden');
        calculateButton.disabled = false;
    }
});
