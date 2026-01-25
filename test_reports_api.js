// Test script to check if the reports API is working
const API_BASE = 'http://localhost:8000/api';

async function testReportsAPI() {
    try {
        console.log('Testing reports API...');
        
        const response = await fetch(`${API_BASE}/reports`);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            console.log(`✅ Success! Found ${data.data.total} reports`);
            console.log('First few reports:');
            data.data.reports.slice(0, 3).forEach((report, index) => {
                console.log(`${index + 1}. ${report.productName} by ${report.brand} (Score: ${report.purityScore})`);
            });
        } else {
            console.log('❌ API returned success=false');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the test
testReportsAPI();