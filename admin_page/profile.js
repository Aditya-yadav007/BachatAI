function makeGenderEditable() {
    const genderDiv = document.getElementById('gender');
    const currentValue = genderDiv.textContent.trim();
    
    // Don't make editable if it's already an input or if it's still loading
    if (genderDiv.querySelector('select') || currentValue === 'Loading...') {
        return;
    }
    
    // Create a select dropdown for gender
    const select = document.createElement('select');
    select.className = 'w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    
    // Gender options
    const options = [
        { value: '', text: 'Select Gender' },
        { value: 'Male', text: 'Male' },
        { value: 'Female', text: 'Female' },
        { value: 'Other', text: 'Other' },
        { value: 'Prefer not to say', text: 'Prefer not to say' }
    ];
    
    // Add options to select
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        if (option.value === currentValue) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });
    
    // Create save and cancel buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-2 mt-2';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500';
    
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);
    
    // Clear the div and add the select and buttons
    genderDiv.innerHTML = '';
    genderDiv.appendChild(select);
    genderDiv.appendChild(buttonContainer);
    
    // Remove click handler temporarily
    genderDiv.onclick = null;
    genderDiv.classList.remove('cursor-pointer', 'hover:bg-gray-100');
    genderDiv.classList.add('bg-white');
    
    // Focus on the select
    select.focus();
    
    // Save button functionality
    saveButton.onclick = function(e) {
        e.stopPropagation();
        const newValue = select.value;
        if (newValue) {
            genderDiv.innerHTML = newValue;
            restoreGenderField();
            // Here you can add code to save the value to your backend/database
            console.log('Gender updated to:', newValue);
        } else {
            alert('Please select a gender');
        }
    };
    
    // Cancel button functionality
    cancelButton.onclick = function(e) {
        e.stopPropagation();
        genderDiv.innerHTML = currentValue;
        restoreGenderField();
    };
    
    // Handle Enter key to save
    select.onkeydown = function(e) {
        if (e.key === 'Enter') {
            saveButton.click();
        } else if (e.key === 'Escape') {
            cancelButton.click();
        }
    };
    
    // Handle clicking outside to cancel
    document.addEventListener('click', function handleOutsideClick(e) {
        if (!genderDiv.contains(e.target)) {
            genderDiv.innerHTML = currentValue;
            restoreGenderField();
            document.removeEventListener('click', handleOutsideClick);
        }
    });
}

function restoreGenderField() {
    const genderDiv = document.getElementById('gender');
    genderDiv.onclick = makeGenderEditable;
    genderDiv.classList.add('cursor-pointer', 'hover:bg-gray-100');
    genderDiv.classList.remove('bg-white');
    genderDiv.classList.add('bg-gray-50');
}