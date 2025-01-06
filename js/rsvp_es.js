const scriptURL = 'https://script.google.com/macros/s/AKfycbyEoETS0m0d1gCl0y3Vxha5oNKWPj8mjozek0aQseCClF0xTBRVaaL28fZXe0-Dn3fIqw/exec'
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
        if (this.value === 'yes') {
            yesParticipationFields.style.display = 'block'
            noParticipationFields.style.display = 'none'
        } else if (this.value === 'no') {
            noParticipationFields.style.display = 'block'
            yesParticipationFields.style.display = 'none'
        } else {
            noParticipationFields.style.display = 'none'
            yesParticipationFields.style.display = 'none'
        }
    })

    // Guest count changes
    document.getElementById('numAdults').addEventListener('change', updateGuestFields)
    document.getElementById('numChildren').addEventListener('change', updateGuestFields)
    document.getElementById('numChildrenNoMenu').addEventListener('change', updateGuestFields)
    
    // Form submission
    form.addEventListener('submit', e => {
        e.preventDefault()
        
        const formData = new FormData(form)
        const email = formData.get('email')
        const phone = formData.get('phonePrefix') + formData.get('phone')
        const participates = formData.get('participation')
        const busService = formData.get('busService') || 'no'
        
        let guests = []
        
        if (participates === 'no') {
            // Single non-participating guest
            guests.push({
                name: formData.get('fullName'),
                email: email,
                phone: phone,
                participates: 'no',
                bus: 'no',
                menuType: '',
                menuDiet: ''
            })
        } else {
            // Process adult guests
            const adultCount = parseInt(formData.get('numAdults')) || 0
            for (let i = 0; i < adultCount; i++) {
                const dietary = formData.get(`adult_${i}_dietary`)
                guests.push({
                    name: formData.get(`adult_${i}_name`),
                    email: email,
                    phone: phone,
                    participates: 'yes',
                    bus: busService,
                    menuType: 'adult',
                    menuDiet: dietary === 'other' 
                        ? formData.get(`adult_${i}_dietary_notes`)
                        : dietaryOptions.find(opt => opt.value === dietary)?.label || ''
                })
            }
            
            // Process children with menu
            const childCount = parseInt(formData.get('numChildren')) || 0
            for (let i = 0; i < childCount; i++) {
                const dietary = formData.get(`child_${i}_dietary`)
                guests.push({
                    name: formData.get(`child_${i}_name`),
                    email: email,
                    phone: phone,
                    participates: 'yes',
                    bus: busService,
                    menuType: 'child',
                    menuDiet: dietary === 'other' 
                        ? formData.get(`child_${i}_dietary_notes`)
                        : dietaryOptions.find(opt => opt.value === dietary)?.label || ''
                })
            }
            
            // Process children without menu
            const noMenuCount = parseInt(formData.get('numChildrenNoMenu')) || 0
            for (let i = 0; i < noMenuCount; i++) {
                guests.push({
                    name: formData.get(`nomenu_${i}_name`),
                    email: email,
                    phone: phone,
                    participates: 'yes',
                    bus: busService,
                    menuType: 'none',
                    menuDiet: ''
                })
            }
        }
        
        // Send to Google Apps Script
        fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify({ guests }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                form.style.display = 'none'
                document.getElementById('successMessage').style.display = 'block'
                document.getElementById('errorMessage').style.display = 'none'
            } else {
                throw new Error('Submission failed')
            }
        })
        .catch(error => {
            console.error('Error:', error)
            document.getElementById('errorMessage').style.display = 'block'
            document.getElementById('successMessage').style.display = 'none'
        })
    })
}) 