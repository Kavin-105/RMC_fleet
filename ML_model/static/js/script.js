// Form submission
document.getElementById('predictionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        rpm: parseFloat(document.getElementById('rpm').value),
        oil_pressure: parseFloat(document.getElementById('oil_pressure').value),
        fuel_pressure: parseFloat(document.getElementById('fuel_pressure').value),
        coolant_pressure: parseFloat(document.getElementById('coolant_pressure').value),
        oil_temp: parseFloat(document.getElementById('oil_temp').value),
        coolant_temp: parseFloat(document.getElementById('coolant_temp').value)
    };
    
    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    
    // Show loading state
    document.getElementById('statusText').textContent = 'Analyzing...';
    document.getElementById('confidenceText').textContent = '0%';
    
    try {
        // Make prediction request
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        // Display results
        displayResults(result);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error making prediction. Please try again.');
        resultsSection.style.display = 'none';
    }
});

// Display prediction results
function displayResults(result) {
    // Update status
    document.getElementById('statusText').textContent = result.status;
    document.getElementById('confidenceText').textContent = `${result.confidence}%`;
    
    // Display remedies or no issues message
    if (result.issues && result.issues.length > 0) {
        document.getElementById('remediesSection').style.display = 'block';
        document.getElementById('noIssuesMessage').style.display = 'none';
        displayRemedies(result.issues);
    } else {
        document.getElementById('remediesSection').style.display = 'none';
        document.getElementById('noIssuesMessage').style.display = 'block';
    }
}

// Display remedies
function displayRemedies(issues) {
    const container = document.getElementById('remediesList');
    container.innerHTML = '';
    
    issues.forEach((issue) => {
        const card = document.createElement('div');
        card.className = 'remedy-card';
        
        card.innerHTML = `
            <div class="remedy-title">${issue.issue}</div>
            <div>Current: ${issue.value}</div>
            <div><strong>Action:</strong> ${issue.remedy}</div>
        `;
        
        container.appendChild(card);
    });
}

// Load sample data
function loadSampleData() {
    const scenarios = {
        '1': {
            name: 'Good Condition',
            data: { rpm: 750, oil_pressure: 3.5, fuel_pressure: 12.0, coolant_pressure: 2.5, oil_temp: 80, coolant_temp: 78 }
        },
        '2': {
            name: 'Low Oil Pressure',
            data: { rpm: 800, oil_pressure: 1.8, fuel_pressure: 12.0, coolant_pressure: 2.5, oil_temp: 80, coolant_temp: 78 }
        },
        '3': {
            name: 'High Temperature',
            data: { rpm: 900, oil_pressure: 3.5, fuel_pressure: 12.0, coolant_pressure: 2.5, oil_temp: 95, coolant_temp: 98 }
        },
        '4': {
            name: 'Low Fuel Pressure',
            data: { rpm: 850, oil_pressure: 3.5, fuel_pressure: 7.0, coolant_pressure: 2.5, oil_temp: 80, coolant_temp: 78 }
        },
        '5': {
            name: 'High RPM',
            data: { rpm: 4200, oil_pressure: 3.0, fuel_pressure: 12.0, coolant_pressure: 2.0, oil_temp: 92, coolant_temp: 95 }
        },
        '6': {
            name: 'Multiple Issues',
            data: { rpm: 3800, oil_pressure: 1.5, fuel_pressure: 7.0, coolant_pressure: 0.8, oil_temp: 98, coolant_temp: 102 }
        }
    };
    
    // Build selection prompt
    let message = 'Select a sample condition:\n\n';
    for (let key in scenarios) {
        message += `${key}. ${scenarios[key].name}\n`;
    }
    
    const choice = prompt(message);
    
    if (choice && scenarios[choice]) {
        const scenario = scenarios[choice];
        document.getElementById('rpm').value = scenario.data.rpm;
        document.getElementById('oil_pressure').value = scenario.data.oil_pressure;
        document.getElementById('fuel_pressure').value = scenario.data.fuel_pressure;
        document.getElementById('coolant_pressure').value = scenario.data.coolant_pressure;
        document.getElementById('oil_temp').value = scenario.data.oil_temp;
        document.getElementById('coolant_temp').value = scenario.data.coolant_temp;
        
        alert(`Loaded: ${scenario.name}`);
    } else if (choice) {
        alert('Invalid selection. Please choose 1-6.');
    }
}

// Reset results when form is reset
document.getElementById('predictionForm').addEventListener('reset', () => {
    document.getElementById('resultsSection').style.display = 'none';
});

