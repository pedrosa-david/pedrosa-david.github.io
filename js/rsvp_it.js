const scriptURL = 'YOUR_GOOGLE_SCRIPT_URL'
const dietaryOptions = [
    { value: 'none', label: 'Nessuna restrizione' },
    { value: 'vegetarian', label: 'Vegetariano' },
    { value: 'vegan', label: 'Vegano' },
    { value: 'gluten-free', label: 'Senza glutine' },
    { value: 'lactose-free', label: 'Senza lattosio' },
    { value: 'other', label: 'Altro (specificare)' }
]

function createGuestFields(index, type) {
    const isChild = type === 'child'
    const section = document.createElement('div')
    section.className = 'guest-section'
    section.innerHTML = `
        <h4>${isChild ? 'Bambino' : 'Adulto'} ${index + 1}</h4>
        <div class="form-group">
            <input type="text" 
                   class="form-control" 
                   name="${type}_${index}_name" 
                   placeholder="Nome e cognome"
                   required>
        </div>
        <div class="form-group dietary-group">
            <select class="form-control" name="${type}_${index}_dietary" required>
                <option value="">Restrizioni alimentari</option>
                ${dietaryOptions.map(opt => 
                    `<option value="${opt.value}">${opt.label}</option>`
                ).join('')}
            </select>
        </div>
        <div class="form-group dietary-notes" style="display: none;">
            <input type="text" 
                   class="form-control" 
                   name="${type}_${index}_dietary_notes" 
                   placeholder="Specifica le restrizioni alimentari">
        </div>
    `
    return section
}

function updateGuestFields() {
    const adultCount = parseInt(document.getElementById('numAdults').value) || 0
    const childCount = parseInt(document.getElementById('numChildren').value) || 0
    
    const adultContainer = document.getElementById('adultGuests')
    const childContainer = document.getElementById('childGuests')
    
    // Clear existing fields
    adultContainer.innerHTML = ''
    childContainer.innerHTML = ''
    
    // Add adult fields
    for(let i = 0; i < adultCount; i++) {
        adultContainer.appendChild(createGuestFields(i, 'adult'))
    }
    
    // Add child fields
    for(let i = 0; i < childCount; i++) {
        childContainer.appendChild(createGuestFields(i, 'child'))
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
    document.getElementById('numAdults').addEventListener('change', updateGuestFields)
    document.getElementById('numChildren').addEventListener('change', updateGuestFields)
    
    document.querySelector('.rsvp-form').addEventListener('submit', e => {
        e.preventDefault()
        
        const form = e.target
        const formData = new FormData(form)
        
        // Combine phone prefix and number
        const prefix = formData.get('phonePrefix')
        const phone = formData.get('phone')
        formData.set('phone', `${prefix} ${phone}`)
        
        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                if (response.ok) {
                    alert('Grazie per la tua conferma!')
                    form.reset()
                    updateGuestFields() // Reset guest fields
                } else {
                    throw new Error('Network response was not ok')
                }
            })
            .catch(error => {
                console.error('Error:', error)
                alert('Si è verificato un errore durante l\'invio del modulo. Per favore, riprova.')
            })
    })
}) 