export const handler = async (event) => {
    const statusCode = 200;
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        // Check if running locally
        const isLocal = process.env.AWS_SAM_LOCAL === 'true';

        // Access userAge and userHeight from event object
        const { userAge, userHeight } = isLocal ? JSON.parse(event.body) : event;

        // Prepare the conversation history for OpenAI API
        const conversation = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: `Suggest me a workout for one day ${userAge}-year-old with a height of ${userHeight} feet.` },
        ];

        // Make a request to OpenAI API using fetch
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: conversation,
            }),
        });

        // Ensure the response status is OK
        if (!response.ok) {
            throw new Error(`OpenAI API request failed with status: ${response.status}`);
        }

        // Extract the assistant's reply from the OpenAI response
        const responseData = await response.json();
        const assistantReply = responseData.choices[0].message.content;

        // Your logic here to handle the workout suggestion
        // For example, you can log it and return a response
        console.log('Workout suggestion:', assistantReply);

        const responseBody = {
            workoutSuggestion: assistantReply,
        };

        return {
            statusCode,
            headers,
            body: JSON.stringify(responseBody),
        };
    } catch (error) {
        console.error('Error handling the request:', error);

        const responseBody = {
            message: 'Error handling the request',
        };

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify(responseBody),
        };
    }
};
