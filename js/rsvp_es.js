const scriptURL = 'https://script.google.com/macros/s/AKfycbzU0b4HCzo0FdkhMqjwY29Xt-QynrSehkzKKvO_pIhv28zCCVVfg6IkzCkDmOR0AvXsbA/exec'
const dietaryOptions = [
    { value: 'none', label: 'Sin restricciones' },
    { value: 'vegetarian', label: 'Vegetariano' },
    { value: 'vegan', label: 'Vegano' },
    { value: 'gluten-free', label: 'Sin gluten' },
    { value: 'lactose-free', label: 'Sin lactosa' },
    { value: 'other', label: 'Otras (especificar)' }
]

function createGuestFields(index, type) {
    const isChild = type === 'child'
    const section = document.createElement('div')
    section.className = 'guest-section'
    section.innerHTML = `
        <h4>${isChild ? 'Niño' : 'Adulto'} ${index + 1}</h4>
        <div class="form-group">
            <input type="text" 
                   class="form-control" 
                   name="${type}_${index}_name" 
                   placeholder="Nombre y apellidos"
                   required>
        </div>
        <div class="form-group dietary-group">
            <select class="form-control" name="${type}_${index}_dietary" required>
                <option value="">Restricciones alimentarias</option>
                ${dietaryOptions.map(opt => 
                    `<option value="${opt.value}">${opt.label}</option>`
                ).join('')}
            </select>
        </div>
        <div class="form-group dietary-notes" style="display: none;">
            <input type="text" 
                   class="form-control" 
                   name="${type}_${index}_dietary_notes" 
                   placeholder="Especifica las restricciones alimentarias">
        </div>
    `
    return section
}

function updateGuestFields() {
    const adultCount = parseInt(document.getElementById('numAdults').value) || 0
    const childCount = parseInt(document.getElementById('numChildren').value) || 0
    const noMenuCount = parseInt(document.getElementById('numChildrenNoMenu').value) || 0
    
    const adultContainer = document.getElementById('adultGuests')
    const childContainer = document.getElementById('childGuests')
    const noMenuContainer = document.getElementById('nomenuGuests')
    
    // Clear existing fields
    adultContainer.innerHTML = ''
    childContainer.innerHTML = ''
    noMenuContainer.innerHTML = ''
    
    // Add adult fields
    for(let i = 0; i < adultCount; i++) {
        adultContainer.appendChild(createGuestFields(i, 'adult'))
    }
    
    // Add child fields
    for(let i = 0; i < childCount; i++) {
        childContainer.appendChild(createGuestFields(i, 'child'))
    }

    // Add no-menu children (simpler fields, no dietary options)
    for(let i = 0; i < noMenuCount; i++) {
        const div = document.createElement('div')
        div.className = 'guest-section'
        div.innerHTML = `
            <h4>Niño sin menú ${i + 1}</h4>
            <div class="form-group">
                <input type="text" 
                       class="form-control" 
                       name="nomenu_${i}_name" 
                       placeholder="Nombre y apellidos"
                       required>
            </div>
        `
        noMenuContainer.appendChild(div)
    }
    
    // Add dietary notes listeners
    document.querySelectorAll('select[name$="_dietary"]').forEach(select => {
        select.addEventListener('change', function() {
            const notesField = this.parentElement.nextElementSibling
            notesField.style.display = this.value === 'other' ? 'block' : 'none'
        })
    })
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.rsvp-form')
    
    // Participation toggle
    document.getElementById('participation').addEventListener('change', function() {
        const noParticipationFields = document.getElementById('noParticipationFields')
        const yesParticipationFields = document.getElementById('yesParticipationFields')
        
        // Get all required fields in the yes participation section
        const requiredFields = yesParticipationFields.querySelectorAll('[required]')
        
        if (this.value === 'yes') {
            yesParticipationFields.style.display = 'block'
            noParticipationFields.style.display = 'none'
            // Make fields required
            requiredFields.forEach(field => field.required = true)
            // Make the no participation name field not required
            document.getElementById('fullName').required = false
        } else if (this.value === 'no') {
            noParticipationFields.style.display = 'block'
            yesParticipationFields.style.display = 'none'
            // Make fields not required
            requiredFields.forEach(field => field.required = false)
            // Make the no participation name field required
            document.getElementById('fullName').required = true
        } else {
            noParticipationFields.style.display = 'none'
            yesParticipationFields.style.display = 'none'
            // Make all fields not required
            requiredFields.forEach(field => field.required = false)
            document.getElementById('fullName').required = false
        }
    })

    // Guest count changes
    document.getElementById('numAdults').addEventListener('change', updateGuestFields)
    document.getElementById('numChildren').addEventListener('change', updateGuestFields)
    document.getElementById('numChildrenNoMenu').addEventListener('change', updateGuestFields)
    
    // Form submission
    form.addEventListener('submit', e => {
        e.preventDefault()
        console.log('Form submitted')
        
        const formData = new FormData(form)
        const email = formData.get('email')
        const phone = formData.get('phonePrefix') + formData.get('phone')
        const participates = formData.get('participation')
        const busService = formData.get('busService') || 'no'
        
        console.log('Form data collected:', {
            email,
            phone,
            participates,
            busService
        })
        
        let guests = []
        
        if (participates === 'no') {
            console.log('Processing non-participating guest')
            guests.push({
                name: formData.get('fullName'),
                email: email,
                phone: phone,
                participates: 'no',
                bus: 'no',
                menuType: '',
                menuDiet: ''
            })
        }
        
        console.log('Guests data:', guests)
        
        // Send to Google Apps Script
        fetch(scriptURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ guests })
        })
        .then(response => {
            console.log('Response received:', response)
            return response.json()
        })
        .then(data => {
            console.log('Parsed response:', data)
            if (data.result === 'success') {
                form.style.display = 'none'
                document.getElementById('successMessage').style.display = 'block'
                document.getElementById('errorMessage').style.display = 'none'
            } else {
                throw new Error('Submission failed')
            }
        })
        .catch(error => {
            console.error('Error details:', error)
            document.getElementById('errorMessage').style.display = 'block'
            document.getElementById('successMessage').style.display = 'none'
        })
    })
}) 